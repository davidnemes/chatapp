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
            currentMessages: [
                { userId: 1, text: "Szia, hogy vagy?", self: true},
                { userId: 2, text: "Szia, jól!", self: false},
                { userId: 2, text: "kicsit unatkozom de amugy ok", self: false},
                { userId: 1, text: "Na, király", self: true},
                { userId: 1, text: "Tenisz ma 6?", self: true},
                { userId: 2, text: "K", self: false},
                { userId: 1, text: "Zsir", self: true},
            ],
        }
    },
    methods: {
        async getMessage() {
            let res = await this.axios("/api/message")
            if(res.data) {
                this.message = res.data
                return
            }
            this.message = res.message ? res.message : res
        },
        logout() {
            sessionStorage.clear()
            window.location.href = "/"
        },
        sendMessage(event) {
            event.preventDefault()
            this.webSocket.send(JSON.stringify({ message: this.messageToSend }))
        },

        msgPosted(msg) {
            let user = JSON.parse(sessionStorage.getItem("user"))
            this.currentMessages.push({
                userId: user.userId,
                text: msg,
                self: true
            })

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
        }
    },
    created() {
        // Check if user is logged in
        if(!sessionStorage.getItem("x-access-token")) {
            this.$router.push("/login")
        }

        // Set cssRoot and height
        this.setCSSandHeights()
    },
    async mounted() {
        const res = await this.axios("/api/wstoken")
        if(res.status !== 200) {
            alert("Error at connecting WebSocket")
            return
        }
        const webSocket = new WebSocket(`ws://${this.serverIp}:1100/?token=${res.data.token}`);
        webSocket.onopen = () => {
            console.log("ws opened");
        }
        webSocket.onmessage = (event) => {
            try {
                let parsedMsg = JSON.parse(event.data)
                console.log(parsedMsg);
            } catch (error) {
                console.log(event.data);
            }
        }
        this.webSocket = webSocket
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