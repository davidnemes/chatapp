<template>
    <div id="outerDiv">
        <div id="navigationDiv">
            <h1>
                Home
                <button class="btn btn-warning close" @click="logout">Logout</button>
            </h1>
            <form class="container">
                <input type="text" name="message" id="msgInput" v-model="messageToSend" class="form-control mb-3">
                <button @click="sendMessage" class="btn btn-primary">Send message</button>
            </form>
        </div>
        <div id="chatroomDiv">
            <Chatroom :messages="currentMessages" @postMsg="msgPosted"/>
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
            messageToSend: "",
            webSocket: null,
            cssRoot: null,
            currentMessages: [],
            currentChat: {
                type: "group",
                id: 1
            }
        }
    },
    methods: {
        logout() {
            sessionStorage.clear()
            window.location.href = "/"
        },
        async loadMessages() {
            let messages = (await this.axios("/api/groupmessages/1")).data
            let currentUserId = JSON.parse(sessionStorage.getItem("user")).userId

            let handledArr = messages.map(msgobj => {
                let msg = {
                    userId: msgobj.userId,
                    message: msgobj.message,
                    date: new Date(msgobj.date),
                    // create self
                    self: msgobj.userId == currentUserId,
                }
                return msg
            });
            this.currentMessages = handledArr
        },
        sendMessage(event) {
            event.preventDefault()
            this.webSocket.send(JSON.stringify({ message: this.messageToSend }))
        },

        async msgPosted(msg) {
            let user = JSON.parse(sessionStorage.getItem("user"))
            let toServer = {
                type: "new_message",
                to: "group",

                message: msg,
                userId: user.userId,
                date: new Date(),
                groupId: this.currentChat.id,
            }

            this.webSocket.send(JSON.stringify(toServer))
            // push local
            this.currentMessages.push({
                userId: user.userId,
                message: msg,
                self: true,
                date: new Date()
            })
        },

        async connectWS() {
            const res = await this.axios("/api/wstoken")
            if(res.status !== 200) {
                alert("Error at connecting WebSocket")
                return
            }

            const webSocket = new WebSocket(`ws://${this.serverIp}:1100/?token=${res.data.token}`);
            webSocket.onerror = (err) => {
                if(err.eventPhase === 2) {
                    alert("Error at connecting ws. Maybe the LanIP was set poorly.")
                } else {
                    alert("Error at connecting ws.")
                }
            }
            webSocket.onopen = () => {
                console.log("ws opened");
            }
            webSocket.onmessage = (event) => {
                if (this.isJson(event.data)) {
                    let msg = JSON.parse(event.data)
                    let currentUserId = JSON.parse(sessionStorage.getItem("user")).userId
                    if (this.currentChat.type == msg.to && this.currentChat.id == msg.groupId) {
                        this.currentMessages.push({
                            userId: msg.userId,
                            message: msg.message,
                            date: new Date(msg.date),
                            // create self
                            self: msg.userId == currentUserId,
                        })
                    } else {
                        // received message not for this chatroom
                    }
                } else {
                    console.log("got unparseable string: ");
                    console.log(event.data);
                }
            }
            this.webSocket = webSocket
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
        if(!sessionStorage.getItem("x-access-token")) {
            this.$router.push("/login")
        }

        // Set cssRoot and height
        this.setCSSandHeights()

        // Load Messages
        await this.loadMessages()
    },
    async mounted() {
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
</style>