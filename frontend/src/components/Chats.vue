<template>
    <div>
        <ul v-if="chatsObj.chats.length > 0" class="m-0 p-0">
            <li class="chatLink m-2 p-2"
                v-for="chat, index in renderChats"
                :key="index"
                :class="currentChatId == chat.id ? 'activeChat' : ''"
                :id="chat.elId"
                @click="toChat">
                <img v-if="chat.group" :src="`/images/grouppic-default.png`" data-child="true" alt="..." class="avatar chatPic" onerror="this.src='/images/grouppic-default.jpg'">
                <img v-if="chat.private" :src="`/images/profpic-userId-${user.userId}.${user.picExt}`" data-child="true" alt="..." class="avatar chatPic" onerror="this.src='/images/profpic-default.jpg'">
                <h6 class="m-0" :class="chat.font_weight" data-child="true">
                    {{ chat.title }}
                    <i v-if="chat.font_weight == 'font-weight-bold'" class="fas fa-exclamation-circle ml-3"></i>
                </h6>
            </li>
        </ul>
        <div v-else>
            <p class="alert alert-warning m-2">Loading...</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "Chats",
    props: {
        chatsObj: Object,
    },
    data() {
        return {
            currentChatId: null
        }
    },
    computed: {
        renderChats() {
            if (this.chatsObj.chats.length < 1) return [] 
            let toRender = this.chatsObj.chats.map(chat => {
                let newChat = chat
                let elId = `${chat.type}-${chat.id}`
                newChat.elId = elId
                newChat.font_weight = this.chatsObj.gotNewMsg.includes(elId) ? "font-weight-bold" : "font-weight-normal"
                return newChat
            })
            return toRender
        }
    },
    methods: {
        toChat(event) {
            let t = event.target
            if (t.dataset.child == "true") t = t.parentElement

            let datas = t.id.split("-")

            let toParent = {
                chatType: datas[0],
                chatId: datas[1]
            }
            this.$emit("changeChat", toParent)
            this.currentChatId = datas[1]
        }
    },
    mounted() {
        setTimeout(() => {
            this.currentChatId = this.chatsObj.chats[0].id
        }, 250)
    }
}
</script>

<style scoped>
.chatLink {
    width: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid gray;
    border-radius: 5px;
    cursor: pointer;
}

.chatPic {
    width: 50px !important;
    height: 50px !important;
    line-height: 50px !important;
}

.activeChat {
    background-color: rgb(62, 206, 199);
}

::-webkit-scrollbar-track {
    background: #ccebff;
}
</style>