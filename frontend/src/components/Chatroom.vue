<template>
    <div class="card card-bordered">
        <div class="card-header">
            <h4 class="card-title">
                <strong>{{ chat.title }}</strong>
            </h4>
            <button class="btn btn-xs btn-secondary">Részletek</button>
        </div>
        <div class="ps-container ps-theme-default ps-active-y" id="chat-content">
            <!-- <div class="media media-chat">
                <img class="avatar" src="https://img.icons8.com/color/36/000000/administrator-male.png" alt="...">
                <div class="media-body">
                    <p>Hi</p>
                    <p>How are you ...???</p>
                    <p>What are you doing tomorrow?<br> Can we come up a bar?</p>
                    <p class="meta"><time datetime="2018">23:58</time></p>
                </div>
            </div>
            <div class="media media-meta-day">Today</div>
            <div class="media media-chat media-chat-reverse">
                <div class="media-body">
                    <p>Hiii, I'm good.</p>
                    <p>How are you doing?</p>
                    <p>Long time no see! Tomorrow office. will be free on sunday. and actually a really long text that it should already go to next line</p>
                    <p class="meta"><time datetime="2018">00:06</time></p>
                </div>
            </div> -->
            <div v-if="msgObj.messages.length > 0 && !msgObj.nomessage">
                <div class="media media-meta-day" v-if="chatOverFlow">Elértél a chat végére</div>
                <div v-for="msgGroup, index in renderMsgs" 
                    :key="index" 
                    class="media media-chat"
                    :class="msgGroup.self ? 'media-chat-reverse': ''"
                    >
                    <img v-if="!msgGroup.self" class="avatar" :src="msgGroup.imgSrc" alt="..." onerror="this.src='/images/profpic-default.jpg'">
                    <div class="media-body">
                        <p v-if="!msgGroup.self" class="meta">{{ msgGroup.un }}</p>
                        <p v-for="msg, index in msgGroup.msgs" :key="index"> {{ msg }}</p>
                        <p class="meta">{{ msgGroup.ttw }}</p>
                    </div>
                </div>
            </div>
            <div v-else-if="msgObj.nomessage">
                <div class="media media-meta-day">A chat jelenleg üres</div>
            </div>
            <div v-else>
                <p class="alert alert-warning m-2">Loading...</p>
            </div>
        </div>
        <form class="publisher bt-1 border-light">
            <input class="publisher-input" type="text" placeholder="Írj valamit..." v-model="newMsg">
            <button type="submit"  @click="postMsg" class="publisher-btn text-info"><i class="fa fa-paper-plane"></i></button>
        </form>
    </div>
</template>

<script>
export default {
    name: "Chatroom",
    props: {
        msgObj: Object,
        chat: Object,
    },
    data() {
        return {
            newMsg: "",
        }
    },
    computed: {
        renderMsgs() {
            let msgs = this.msgObj.messages
            if (typeof msgs !== "object") {
                console.log("not object");
                return []
            }
            // Check if theres no msg
            if (this.msgObj.nomessage) {
                return []
            }

            // Handle messages
            let newMsgs = []
            let msgGroup = {
                // defaults
                self: false,
                msgs: [],
                ttw: "", // -> timeToWrite
                un: "", // -> username
            }
            let previousId = null
            let previousDate = null

            msgs.forEach(msg => {
                if (msg.userId == previousId) {
                    // new group if prev msg is older than 3 mins
                    let diff = msg.date.getTime() - previousDate.getTime()
                    if (diff > (3*60*1000)) {
                        // push previous
                        newMsgs.push(msgGroup)
                        // set current
                        msgGroup = { msgs: [] }
                        msgGroup.self = msg.self
                        msgGroup.imgSrc = `/images/profpic-userId-${msg.userId}.${msg.picExt}`
                        msgGroup.msgs.push(msg.message)
                        msgGroup.ttw = this.timeToWrite(msg.date)
                        msgGroup.un = msg.username
                    } else {
                        msgGroup.msgs.push(msg.message)
                        msgGroup.ttw = this.timeToWrite(msg.date)
                    }
                } else {
                    if (previousId !== null) {
                        newMsgs.push(msgGroup)
                        msgGroup = { msgs: [] }
                    }
                    msgGroup.self = msg.self
                    msgGroup.imgSrc = `/images/profpic-userId-${msg.userId}.${msg.picExt}`
                    msgGroup.msgs.push(msg.message)
                    msgGroup.ttw = this.timeToWrite(msg.date)
                    msgGroup.un = msg.username
                }

                previousDate = msg.date
                previousId = msg.userId
            });
            // push the last one too
            newMsgs.push(msgGroup)

            return newMsgs
        },
        chatOverFlow() {
            let el = this.jQuery("#chat-content")
            try { el = el[0] } catch(err) {"error"}
            return this.checkOverFlow(el)
        }
    },
    methods: {
        postMsg(event) {
            event.preventDefault()

            let msg = this.newMsg
            if (!msg) {
                return
            }
            this.$emit("postMsg", msg)

            this.newMsg = ""
            this.scrollDown()
        },
        scrollDown() {
            setTimeout(() => {
                let scroll = this.jQuery("#chat-content").prop("scrollHeight")
                this.jQuery("#chat-content")[0].scrollTop = scroll
            }, 25)
        },
        timeToWrite(date) {
            let now = new Date()
            let timeToday = now.getHours() * 60 * 60 * 1000
            timeToday += now.getMinutes() * 60 * 1000
            let hours = `${date.getHours()}:${date.getMinutes()}`
            let month = `${date.getMonth()+1}. ${date.getDate()}. ${hours}`
            switch(true) {
                // message today
                case date.getTime() > (now.getTime() - timeToday):
                    return "Ma, "+hours
                case date.getFullYear() == now.getFullYear():
                    return month
                default:
                    return `${date.getFullYear()}. ${month}`
            }
        },
        // pasted helper
        checkOverFlow(el) {
                var curOverf = el.style.overflow;
                  
                if ( !curOverf || curOverf === "visible" )
                    el.style.overflow = "hidden";
                  
                var isOverflowing = el.clientWidth < el.scrollWidth
                    || el.clientHeight < el.scrollHeight;
                  
                el.style.overflow = curOverf;
                  
                return isOverflowing;
            }
    },
    mounted() {
        this.scrollDown()
    }
}
</script>

<style scoped>
.card {
    margin-bottom: 0;
    border: 0;
}
#chat-content {
    overflow-y: scroll !important;
    height: var(--chatRoomHeight) !important;
}

@media screen and (max-width: 500px) {
    
    .dropMini {
        width: 50px;
    }
}
</style>
