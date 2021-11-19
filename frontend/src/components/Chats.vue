<template>
    <div>
        <div>
            <Searchbar :type="'full'" @gotResult="gotSearchRes" @clear="clearSearch" />
            <div>
                <i class="fas fa-plus mr-2"></i>
                <p class="description m-0">Új csoport</p>
            </div>
        </div>

        <!-- Search results -->
        <div v-if="!search.clear && search.res.length > 0" class="m-0 p-0">
            <h4 class="m-0 alert">Eredmények:</h4>
            <ul class="m-0 p-0">
                <li class="chatLink m-2 p-2"
                    v-for="res, index in search.res"
                    :key="index">
                    <img v-if="res.type == 'group'" :src="`/images/grouppic-default.png`" alt="..." class="avatar chatPic" onerror="this.src='/images/grouppic-default.png'">
                    <img v-if="res.type == 'user'" :src="`/images/${res.picName}`" alt="..." class="avatar chatPic" onerror="this.src='/images/profpic-default.jpg'">
                    <h6 class="m-0">
                        {{ res.title }} {{ res.state }}
                    </h6>

                </li>
            </ul>
        </div>
        <div v-else-if="!search.clear && search.res.length == 0">
            <h5 class="alert alert-secondary m-2">Nincs találat...</h5>
        </div>

        <!-- Chatek -->
        <ul v-else-if="chatsObj.chats.length > 0" class="m-0 p-0">
            <li class="chatLink m-2 p-2"
                v-for="chat, index in renderChats"
                :key="index"
                :class="currentChatId == chat.elId ? 'activeChat' : ''"
                :id="chat.elId"
                @click="toChat">
                <img v-if="chat.group" :src="`/images/grouppic-default.png`" data-child="true" alt="..." class="avatar chatPic" onerror="this.src='/images/grouppic-default.png'">
                <img v-if="chat.private" :src="`/images/${chat.picName}`" data-child="true" alt="..." class="avatar chatPic" onerror="this.src='/images/profpic-default.jpg'">
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
import Searchbar from "./Searchbar.vue"

export default {
    name: "Chats",
    props: {
        chatsObj: Object,
    },
    components: {
        Searchbar,
    },
    data() {
        return {
            currentChatId: null,
            search: {
                clear: true,
                res: []
            }
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

            let toParentComp = {
                chatType: datas[0],
                chatId: datas[1]
            }
            this.$emit("changeChat", toParentComp)
            this.currentChatId = t.id
        },
        selectFirst() {
            if (this.currentChatId === null) {
                setTimeout(() => {
                    this.currentChatId = `${this.chatsObj.chats[0].type}-${this.chatsObj.chats[0].id}`
                }, 100)
            }
        },
        gotSearchRes(res) {
            this.search.clear = false
            this.search.res = res
            console.log(res);
        },
        clearSearch() {
            this.search.clear = true
        }
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

.activeChat {
    background-color: rgb(62, 206, 199);
}

::-webkit-scrollbar-track {
    background: #ccebff;
}
</style>

<style>
.chatPic {
    width: 50px !important;
    height: 50px !important;
    line-height: 50px !important;
}
</style>