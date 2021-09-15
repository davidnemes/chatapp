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
            <ul>
                <div v-for="message, index in messages" :key="index" class="messageDiv">
                    <img v-if="!message.self" src="" alt="profImg">
                    <li class="message m-2" :class="message.self ? selfClass : ''">
                        {{ message.text }}
                    </li>
                    {{ message.date }}
                </div>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: "Home",
    data() {
        return {
            messageToSend: "",
            webSocket: null,
            cssRoot: null,
            messages: [
                { userId: 1, date: Date(), text: "valami uzenet", self: true},
                { userId: 2, date: Date().split(" GMT")[0], text: "valami más uzenet", self: false},
            ],
            selfClass: "self"
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
        setHeight(diff) {
            this.setCssVarValue("--innerHeight", window.innerHeight + diff)
        }
    },
    created() {
        // Check if user is logged in
        if(!sessionStorage.getItem("x-access-token")) {
            this.$router.push("/login")
        }

        // Set cssRoot and height
        this.cssRoot = document.querySelector(':root')
        this.setHeight(-60)
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
.messageDiv {
    display: flex;
}
.message {
    display: inline;
    padding: 0.5em;
    border-radius: 2em;
    background-color: lightgray;
}
.self {
    background-color: blue;
    color: white;
}
</style>