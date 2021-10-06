<template>
    <div id="outerDiv">
        <div id="navigationDiv">
            <h1>
                Home
            </h1>
            <button class="btn btn-warning p-2" @click="logout">Logout</button>
            <div @click="toProfile" id="profileDiv">
                <img :src="`/images/profpic-userId-${user.userId}.jpg`" alt="..." class="avatar" onerror="this.src='/images/profpic-default.jpg'">
                <p>{{ user.username }}</p>
            </div>
        </div>
        <div id="chatroomDiv">
            <Chatroom :msgObj="currentMessages" @postMsg="msgPosted" ref="chatroom" />
        </div>
    </div>
</template>

<script>
import Chatroom from "./Chatroom.vue"

export default {
    name: "Home",
    components: {
        Chatroom,
    },
    data() {
        return {
            webSocket: null,
            cssRoot: null,
            // an error occured when i did it like --> currentMessages = []
            currentMessages: {
                messages: []
            },
            currentChat: {
                type: "group",
                id: 1
            }
        }
    },
    computed: {
        user() {
            if (sessionStorage.getItem("user")) {
                return JSON.parse(sessionStorage.getItem("user"))
            } else {
                return { userId: 0, username: "default", role: { role: "user", weight: 10 }}
            }
        }
    },
    methods: {
        logout() {
            sessionStorage.clear()
            localStorage.clear()
            window.location.href = "/"
        },
        async loadMessages() {
            let messages = (await this.axios("/api/groupmessages/1")).data
            if(!messages) { return false }
            let handledArr = messages.map(msgobj => {
                let msg = {
                    userId: msgobj.userId,
                    message: msgobj.message,
                    date: new Date(msgobj.date),
                    // create self
                    self: msgobj.userId == this.user.userId,
                    username: msgobj.User.username
                }
                return msg
            });
            this.currentMessages.messages = handledArr
            this.$refs.chatroom.scrollDown()
        },

        async msgPosted(msg) {
            let toServer = {
                type: "new_message",
                to: "group",

                message: msg,
                userId: this.user.userId,
                username: this.user.username,
                date: new Date(),
                groupId: this.currentChat.id,
            }

            this.webSocket.send(JSON.stringify(toServer))
            // push local
            this.currentMessages.messages.push({
                userId: this.user.userId,
                username: this.user.username,
                message: msg,
                self: true,
                date: new Date()
            })
        },

        async connectWS() {
            const res = await this.axios("/api/token/ws")
            if(res.status !== 200) {
                alert("Error at connecting WebSocket")
                return
            }

            const webSocket = new WebSocket(`ws://${this.serverIp}:1100/?token=${res.data.token}`);
            webSocket.onerror = (err) => {
                if(err.eventPhase === 2) {
                    // Maybe the LanIP was set poorly.
                    alert("Error at connecting ws.")
                } else {
                    alert("Error at ws.")
                }
            }
            webSocket.onopen = () => {
                console.log("ws opened");
            }
            webSocket.onmessage = (event) => {
                this.wsOnMessage(event)
            }
            this.webSocket = webSocket
        },

        wsOnMessage(event) {
            if (this.isJson(event.data)) {
                let msg = JSON.parse(event.data)
                if (this.currentChat.type == msg.to && this.currentChat.id == msg.groupId) {
                    this.currentMessages.messages.push({
                        userId: msg.userId,
                        username: msg.username,
                        message: msg.message,
                        date: new Date(msg.date),
                        // create self
                        self: msg.userId == this.user.userId,
                    })
                    this.$refs.chatroom.scrollDown()
                } else {
                    // received message not for this chatroom
                }
            } else {
                console.log("got unparseable string: ");
                console.log(event.data);
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
                let user = JSON.parse(localStorage.getItem("user"))
                let data = {
                    reason: "remember_me",
                    user,
                    token: localStorage.getItem("x-remember-token").replaceAll('"', '')
                }
                let res = await this.axios("/api/token/accesstoken", "post", data)
                let token = JSON.parse(res.data).accessToken
                
                if(!token) {
                    this.logout()
                }

                sessionStorage.setItem("x-access-token", token)
                sessionStorage.setItem("user", JSON.stringify(user))
                console.log("set user");
            } else {
                // the flow never should get here btw
                this.$router.push("/login")
            }
        }

        // Set cssRoot and height
        this.setCSSandHeights()

        // Load Messages
        console.log("load msgs");
        await this.loadMessages()
        await this.connectWS()
    },
    async mounted() {
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
#profileDiv {
    align-items: center;
    cursor: pointer;
    display: flex;
    
}
@media screen and (max-width: 500px) {
    #navigationDiv {
        display: none;
    }
    #chatroomDiv {
        width: 100%;
    }
}
</style>