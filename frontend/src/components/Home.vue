<template>
    <div id="outerDiv">
        <div id="navigationDiv">
            <header id="navigationHeader" class="p-1">
                <div id="chappDiv">
                    <img src="../assets/drop.png" alt="csepp" class="dropMini">
                    <h4 class="m-0"><i>Chapp</i></h4>
                </div>
                <div class="dropdown">
                    <div @click="toProfile" id="profileDiv" class="p-2" data-toggle="dropdown">
                        <span class="mr-2">{{ user.username }}</span>
                        <img :src="`/images/profpic-userId-${user.userId}.${user.picExt}`" alt="..." class="avatar" onerror="this.src='/images/profpic-default.jpg'">
                    </div>
                    <div class="dropdown-menu dropright">
                        <h4 class="dropdown-header">{{ user.username }}</h4>
                        <a class="dropdown-item" data-toggle="modal" data-target="#userManagement">Felhasználó kezelése</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" @click="logout">Kijelentkezés</a>
                    </div>
                </div>
            </header>
            <Chats id="navigationChats" :chatsObj="chatsObj" @changeChat="chatChanged" ref="chats" />
        </div>
        <div id="chatroomDiv">
            <Chatroom :msgObj="currentMessages" @postMsg="msgPosted" ref="chatroom" />
        </div>

        <!-- Elements with changing place -->
        <div class="tokenExpireAlert alert alert-warning alert-dismissible fade show">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            <strong>Bejelentkezés meghosszabítása</strong><br>
            A bejelentkezésed kevesebb mint 5 perc múlva lejár.
            <a @click="renewLogin" class="alert-link" style="cursor: pointer;">Meghosszabítás</a>
        </div>

        <UserManagement id="userManagement" @logout="logout" />
    </div>
</template>

<script>
import Chatroom from "./Chatroom.vue"
import UserManagement from "./UserManagement.vue"
import Chats from "./Chats.vue"

export default {
    name: "Home",
    components: {
        Chatroom,
        UserManagement,
        Chats
    },
    data() {
        return {
            webSocket: null,
            cssRoot: null,
            // an error occured when i did it like --> currentMessages = [] and chats = []
            // the outer object is needed for asynchronous mutation
            currentMessages: {
                messages: []
            },
            chatsObj: {
                chats: [],
                // chats that has to be bold
                gotNewMsg: [],
            },

            currentChat: {
                type: "group",
                id: 1
            },

            // cache for messages
            messages: {}
        }
    },
    computed: {
        user() {
            if (sessionStorage.getItem("user")) {
                return JSON.parse(sessionStorage.getItem("user"))
            } else {
                return { userId: 0, username: "default", role: { role: "user", weight: 10 }}
            }
        },
        chatName() {
            let { id, type } = this.currentChat
            return `${type}-${id}`
        }
    },
    methods: {
        logout() {
            sessionStorage.clear()
            localStorage.clear()
            window.location.href = "/"
        },
        async loadChats() {
            let data = (await this.axios("/api/chats/"+ this.user.userId)).data
            if (!data) { return false }
            
            this.currentChat.type = data.chats[0].type
            this.currentChat.id = data.chats[0].id

            this.chatsObj.chats = data.chats
        },
        async loadMessages() {
            let { id, type } = this.currentChat
            let messages
            if (type == "group") {
                messages = (await this.axios("/api/groupmessages/"+id)).data
            } else if(type == "private") {
                messages = (await this.axios("/api/privatemessages/"+id)).data
            } else {
                alert("Error at loading messages, chat type does not match")
                return false
            }
            if(!messages) { return false }
            let handledArr = messages.map(msgobj => {
                let msg = {
                    userId: msgobj.userId,
                    message: msgobj.message,
                    date: new Date(msgobj.date),
                    // create self
                    self: msgobj.userId == this.user.userId,
                    username: msgobj.User.username,
                    picExt: msgobj.User.picExt
                }
                return msg
            });
            this.currentMessages.messages = handledArr
            this.$refs.chatroom.scrollDown()

            // caching loaded messages
            this.messages[this.chatName] = handledArr
        },

        chatChanged(to) {
            this.currentChat.type = to.chatType
            this.currentChat.id = to.chatId

            let cached = this.messages[this.chatName]
            if (cached) {
                this.currentMessages.messages = cached
                this.$refs.chatroom.scrollDown()
            } else {
                this.loadMessages()
            }
            this.chatsObj.gotNewMsg = this.chatsObj.gotNewMsg.filter(id => id != this.chatName)
        },
        async msgPosted(msg) {
            if (this.webSocket.readyState !== 1) {
                alert("Connection broke with websocket")
                location.reload()
                return
            }
            let now = new Date()
            let toServer = {
                type: "new_message",
                to: this.currentChat.type,

                message: msg,
                userId: this.user.userId,
                username: this.user.username,
                picExt: this.user.picExt,
                date: now,
                chatId: this.currentChat.id,
            }

            this.webSocket.send(JSON.stringify(toServer))
            // push local
            this.currentMessages.messages.push({
                message: msg,
                userId: this.user.userId,
                username: this.user.username,
                picExt: this.user.picExt,
                date: now,
                self: true,
            })

            // move chat to top
            let index = this.chatsObj.chats.findIndex(chat => {
                return chat.type == this.currentChat.type && chat.id == this.currentChat.id
            })
            if (index != 0 && index != -1) {
                // splice takes out the chat from chats
                let chatAtIndex = this.chatsObj.chats.splice(index, 1)[0]
                this.chatsObj.chats.unshift(chatAtIndex)
            }
        },

        async connectWS() {
            const res = await this.axios("/api/token/ws")
            if(res.status !== 200) {
                alert("Error at starting WebSocket")
                return
            }

            const webSocket = new WebSocket(`ws://${location.host}/?token=${res.data.token}&id=${this.user.userId}`);
            webSocket.onerror = (err) => {
                if(err.eventPhase === 2) {
                    // Maybe the LanIP was set poorly.
                    alert("Error at WS connection.")
                } else {
                    alert("Error at WS.")
                }
            }
            webSocket.onopen = () => {
                console.log("WS -> ws opened");
            }
            webSocket.onmessage = (event) => {
                this.wsOnMessage(event)
            }
            this.webSocket = webSocket
        },

        wsOnMessage(event) {
            if (!this.isJson(event.data)) {
                console.log("WS -> got unparseable string: ");
                console.log(event.data);
                return
            }

            let msg = JSON.parse(event.data)
            if (msg.type == "new_message") {
                let objToPush = {
                    userId: msg.userId,
                    username: msg.username,
                    picExt: msg.picExt,
                    message: msg.message,
                    date: new Date(msg.date),
                    // create self
                    self: msg.userId == this.user.userId,
                }

                if (this.currentChat.type == msg.to && this.currentChat.id == msg.chatId) {
                    this.currentMessages.messages.push(objToPush)
                    this.$refs.chatroom.scrollDown()
                } else {
                    // received message not for this chatroom
                    let forChat = `${msg.to}-${msg.chatId}`
                    this.chatsObj.gotNewMsg.push(forChat)
                    let cached = this.messages[forChat]
                    if (cached) {
                        cached.push(objToPush)
                    }
                }
                
                // move chat to top
                let index = this.chatsObj.chats.findIndex(chat => {
                    return msg.to == chat.type && msg.chatId == chat.id
                })
                if (index != 0 && index != -1) {
                    // splice takes out the chat from chats
                    let chatAtIndex = this.chatsObj.chats.splice(index, 1)[0]
                    this.chatsObj.chats.unshift(chatAtIndex)
                }
            } else {
                console.log("WS -> got Something different");
                console.log(msg);
            }
            
        },

        // Accesstoken expiration
        async newAccessToken(user) {
            let data = {
                reason: "remember_me",
                user,
                token: localStorage.getItem("x-remember-token").replaceAll('"', '')
            }
            let res = await this.axios("/api/token/accesstoken", "post", data)
            let token = res.data.accessToken
            
            if (res.error || !token) {
                alert("Sikertelen bejelentkezés")
                this.logout()
            }

            sessionStorage.setItem("x-access-token", token)
            sessionStorage.setItem("x-acc-expiration", res.data.expiration)
            this.jQuery(".tokenExpireAlert").css("display", "none")
            sessionStorage.setItem("user", JSON.stringify(user))
        },
        setAccTokenExpire() {
            let time = parseInt(sessionStorage.getItem("x-acc-expiration")) - Date.now() - (5*60*1000)
            if (time < 0) {
                if (localStorage.getItem("user")) {
                    sessionStorage.clear()
                    location.reload()
                } else {
                    this.logout()
                }
            }
            setTimeout(() => {
                console.log("need new accesstoken");
                this.accessTokenExpire()
            }, time)
        },
        accessTokenExpire() {
            this.jQuery(".tokenExpireAlert").css("display", "block")
            setTimeout(() => {
                if (localStorage.getItem("user")) {
                    sessionStorage.clear()
                    location.reload()
                } else {
                    this.logout()
                }
            }, 5*60*1000);
        },
        renewLogin() {
            if (localStorage.getItem("user")) {
                sessionStorage.clear()
                location.reload()
            } else {
                alert("Mivel nem kérted bejelentkezésed megjegyzését, át leszel irányítva a bejelentkezéshez.")
                this.logout()
            }
        },

        // Functions with CSS variables
        getCssVarValue(varName) {
            var rs = getComputedStyle(this.cssRoot);
            return rs.getPropertyValue(varName)
        },
        setCssVarValue(varName, valueToSet) {
            try {
                this.cssRoot.style.setProperty(varName, valueToSet +"px");
            } catch(err) {
                console.log(err);
                return false
            }
            return true
        },
        setCSSandHeights() {
            this.cssRoot = document.querySelector(':root')
            this.setCssVarValue("--innerHeight", window.innerHeight)
            this.setCssVarValue("--chatRoomHeight", window.innerHeight - 140)
            this.setCssVarValue("--appMT", 0)
        },

        // Helpers
        isJson(data) {
            try {
                JSON.parse(data)
                return true
            } catch (err) {
                return false
            }
        }
    },
    async created() {
        // Check if user is logged in
        let sstoken = sessionStorage.getItem("x-access-token")
        if(!sstoken) {
            let lsuser = localStorage.getItem("user")
            if(lsuser) {
                // user hit remember me
                let user = JSON.parse(lsuser)
                await this.newAccessToken(user)
            } else {
                // the flow never should get here btw
                this.$router.push("/login")
            }
        }

        // Set access-token expiration
        this.setAccTokenExpire()

        // Set cssRoot and height
        this.setCSSandHeights()

        // Load Chats
        await this.loadChats()

        // Load Messages
        await this.loadMessages()
        await this.connectWS()
    }
}
</script>
<style>
:root {
    --innerHeight: 100px; /* default value */
    --chatRoomHeight: 50px; /* default value; for Chatroom component */
}

#outerDiv {
    display: flex;
}
#navigationDiv {
    width: 33%;
    height: var(--innerHeight);
}
#chatroomDiv {
    width: 67%;
    height: var(--innerHeight);
}

#navigationHeader {
    justify-content: space-between !important;
    border-bottom: 2px solid lightgray;
}
#profileDiv, #navigationHeader, #chappDiv {
    align-items: center;
    cursor: pointer;
    display: flex;
    justify-content: left;
    border-radius: 3px;
}
#profileDiv:hover {
    background-color: lightgray;
}
#navigationChats {
    overflow-y: scroll;
    height: calc(var(--innerHeight) - 62px);
}

.dropMini {
    width: 20%;
}
.tokenExpireAlert {
    display: none;
    position: absolute;
    top: 10px;
    right: 5px;
}


@media screen and (max-width: 500px) {
    #navigationDiv {
        display: none;
    }
    #chatroomDiv {
        width: 100%;
    }
    .tokenExpireAlert {
        font-size: 80%;
    }
    .dropMini {
        width: 50px;
    }
}
@media screen and (min-width: 1000px) {
    .dropMini {
        width: 60px;
    }
}
</style>