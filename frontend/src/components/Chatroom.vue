<template>
    <div class="card card-bordered">
        <div class="card-header">
            <h4 class="card-title">
                <strong>Chat</strong>
            </h4>
            <button class="btn btn-xs btn-secondary" href="#" data-abc="true">Részletek</button>
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
            </div>
            <div class="media media-chat"> <img class="avatar" src="https://img.icons8.com/color/36/000000/administrator-male.png" alt="...">
                <div class="media-body">
                    <p>Okay</p>
                    <p>We will go on sunday? </p>
                    <p class="meta"><time datetime="2018">00:07</time></p>
                </div>
            </div>
            <div class="media media-chat media-chat-reverse">
                <div class="media-body">
                    <p>That's awesome!</p>
                    <p>I will meet you Sandon Square sharp at 10 AM</p>
                    <p>Is that okay?</p>
                    <p class="meta"><time datetime="2018">00:09</time></p>
                </div>
            </div>
            <div class="media media-chat">
                <img class="avatar" src="https://img.icons8.com/color/36/000000/administrator-male.png" alt="...">
                <div class="media-body">
                    <p>Okay i will meet you on Sandon Square </p>
                    <p class="meta"><time datetime="2018">00:10</time></p>
                </div>
            </div>
            <div class="media media-chat media-chat-reverse">
                <div class="media-body">
                    <p>Do you have pictures of Matley Marriage?</p>
                    <p class="meta"><time datetime="2018">00:10</time></p>
                </div>
            </div>
            <div class="media media-chat">
                <img class="avatar" src="https://img.icons8.com/color/36/000000/administrator-male.png" alt="...">
                <div class="media-body">
                    <p>Sorry I don't have. i changed my phone.</p>
                    <p class="meta"><time datetime="2018">00:12</time></p>
                </div>
            </div>
            <div class="media media-chat media-chat-reverse">
                <div class="media-body">
                    <p>Okay then see you on sunday!!</p>
                </div>
            </div> -->
            <div v-if="msgObj.messages.length > 0">
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
            <div v-else>
                <p class="alert alert-warning m-2 w-100">Loading...</p>
            </div>
            <!-- <div class="ps-scrollbar-x-rail" style="left: 0px; bottom: 0px;">
                <div class="ps-scrollbar-x" tabindex="0" style="left: 0px; width: 0px;"></div>
            </div>
            <div class="ps-scrollbar-y-rail" style="top: 0px; height: 0px; right: 2px;">
                <div class="ps-scrollbar-y" tabindex="0" style="top: 0px; height: 2px;"></div>
            </div> -->
        </div>
        <form class="publisher bt-1 border-light">
            <input class="publisher-input" type="text" placeholder="Írj valamit..." v-model="newMsg">
            <!-- <span class="publisher-btn file-group"> <i class="fa fa-paperclip file-browser"></i> <input type="file"> </span>    -->
            <!-- <a class="publisher-btn" href="#" data-abc="true"><i class="fa fa-smile"></i></a> -->
            <button type="submit"  @click="postMsg" class="publisher-btn text-info"><i class="fa fa-paper-plane"></i></button>
        </form>
    </div>
</template>

<script>
export default {
    name: "Chatroom",
    props: {
        msgObj: Object,
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
                        msgGroup.imgSrc = `/images/profpic-userId-${msg.userId}.jpg`
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
                    msgGroup.imgSrc = `/images/profpic-userId-${msg.userId}.jpg`
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
            }, 75)
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
                    return hours
                case date.getFullYear() == now.getFullYear():
                    return month
                default:
                    return `${date.getFullYear()}. ${month}`
            }
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
</style>
