<template>
    <div>
        <h1>
            Home
            <button class="btn btn-warning close" @click="logout">Logout</button>
        </h1>
        <form class="container">
            <input type="text" name="message" id="msgInput" v-model="messageToSend" class="form-control mb-3">
            <button @click="sendMessage" class="btn btn-primary">Send message</button>
        </form>
    </div>
</template>

<script>
export default {
    name: "Home",
    data() {
        return {
            messageToSend: "",
            webSocket: null
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
        }
    },
    created() {
        if(!sessionStorage.getItem("x-access-token")) {
            this.$router.push("/login")
        }
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