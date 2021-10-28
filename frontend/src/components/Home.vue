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
                        <a class="dropdown-item" data-toggle="modal" data-target="#userManagement">
                            Felhasználó kezelése
                            <i class="ml-2 fas fa-user"></i>
                        </a>
                        <a class="dropdown-item" @click="reqForNotis" v-if="notiDisplay">
                            Értesítések Bekapcsolása
                            <i class="ml-2 fas fa-bell"></i>
                        </a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" @click="logout">
                            Kijelentkezés
                            <i class="ml-2 fas fa-sign-out-alt"></i>
                        </a>
                    </div>
                </div>
            </header>
            <Chats id="navigationChats" :chatsObj="chatsObj" @changeChat="chatChanged" ref="chats" />
        </div>
        <div id="chatroomDiv">
            <Chatroom :msgObj="currentMessages" :chat="currentChat" @postMsg="msgPosted" ref="chatroom" />
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
            siteFocus: true,
            // n as notifications
            notis: "",
            // an error occured when i did it like --> currentMessages = [] and chats = []
            // the outer object is needed for asynchronous mutation
            currentMessages: {
                messages: [],
                nomessage: false
            },
            chatsObj: {
                chats: [],
                // chats that has to be bold
                gotNewMsg: [],
            },

            currentChat: {
                type: "group",
                id: 1,
                title: "Public",
            },

            // cache for messages
            messages: {},
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
        },
        isHttps() {
            let isLocalhost = document.location.hostname == "localhost" || document.location.hostname == "127.0.0.1"
            return document.location.protocol == "https:" || isLocalhost
        },
        notiDisplay() {
            return this.isHttps && this.notis == 'default'
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
            this.currentChat.title = data.chats[0].title

            this.chatsObj.chats = data.chats
            this.$refs.chats.selectFirst()
        },
        chatChanged(to) {
            this.currentChat.type = to.chatType
            this.currentChat.id = to.chatId
            let chatIndex = this.chatsObj.chats.findIndex(k => k.id == to.chatId)
            this.currentChat.title = this.chatsObj.chats[chatIndex].title
            this.currentMessages.nomessage = false

            let cached = this.messages[this.chatName]
            if (cached && cached.length > 0) {
                this.currentMessages.messages = cached
                this.$refs.chatroom.scrollDown()
            } else {
                this.loadMessages()
            }
            this.chatsObj.gotNewMsg = this.chatsObj.gotNewMsg.filter(id => id != this.chatName)
        },

        async loadMessages() {
            let { id, type } = this.currentChat
            let messages
            if (type == "group") {
                let res = await this.axios("/api/messages/group/"+id)
                if (!res.error) {
                    messages = res.data
                }
            } else if(type == "private") {
                let res = await this.axios("/api/messages/private/"+id)
                if (!res.error) {
                    messages = res.data
                }
            } else {
                alert("Error at loading messages, chat type does not match")
                return
            }
            if(messages === undefined || typeof messages !== "object") return
            // Check if theres no msg
            if (messages.length == 0) {
                this.currentMessages.nomessage = true
                this.currentMessages.messages = []
                // caching loaded messages
                this.messages[this.chatName] = []
                return
            }
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
        async msgPosted(msg) {
            if (this.webSocket.readyState !== 1) {
                alert("Connection broke with websocket")
                location.reload()
                return
            }
            // send msg on ws
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
                chatTitle: this.currentChat.type == "group" ? this.currentChat.title : this.user.username,
            }
            this.webSocket.send(JSON.stringify(toServer))
            // check if is first msg
            if (this.currentMessages.nomessage) this.currentMessages.nomessage = false
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
                console.log("WS -> got unparseable string: "+event.data);
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

                // send the right notification
                this.sendNoti(msg)

            } else {
                console.log("WS -> got Something different:");
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

        // Notifications
        setNotis() {
            onfocus = () => {
                this.siteFocus = true
                let titleArr = document.title.split(" ")
                if (titleArr.length > 1) {
                    document.title = titleArr[1]
                }
            },
            onblur = () => {
                this.siteFocus = false
            }

            if (!this.isHttps) {
                console.log("Az Értesítések nem elérhetők nem HTTPS oldalon");
            }

            try {
                this.notis = Notification.permission
            } catch (error) {
                console.log("A böngésződben nem elérhetőek az értesítések");
            }
        },
        reqForNotis() {
            if (!this.isHttps) return

            if (this.notisArePromises) {
                Notification.requestPermission().then(res => {
                    console.log(res);
                    // have to reload because of vue bug: this.notis is not reachable
                    location.reload()
                })
            } else {
                Notification.requestPermission(res => {
                    console.log(res);
                    location.reload()
                })
            }
        },
        sendNoti(msg) {
            if (this.siteFocus) {
                return
            }

            let hasNoti = document.title.split(" ").length == 2
            if (!hasNoti) document.title = "(!) " + document.title
            if (this.notis == "granted") {
                let body = (msg.to == "group" ? "Ide: " : "Tőle: ") + msg.chatTitle
                let noti = new Notification("Új üzenet", {
                    body: body,
                    icon: "/favicon.ico"
                })
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        // The tab has become visible so clear noti
                        noti.close();
                    }
                });
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
        },
        notisArePromises() {
            try {
                Notification.requestPermission().then();
            } catch (err) {
                return false
            }
            return true
        },

        async createdAsync() {
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

            // Connect WebSocket
            await this.connectWS()
        }
    },
    created() {
        // Set Notifications
        this.setNotis()

        this.createdAsync()
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