<template>
    <div>
        <div>
            <Searchbar :type="'full'" @gotResult="gotSearchRes" @clear="clearSearch" />
            <div class="m-1 p-2" id="newGroupDiv">
                <i class="fas fa-plus mr-2" style="font-size: 1em"></i>
                <p class="m-0">Új csoport</p>
            </div>
        </div>

        <!-- Search results -->
        <div v-if="!search.clear && search.res.length > 0" class="m-0 p-0">

            <h4 class="m-0 alert">Eredmények:</h4>
            <ul class="m-0 p-0">
                <li class="chatLink m-2 p-2 border-bottom-0"
                    v-for="res, index in search.res"
                    :key="index">
                    <div class="flexBox">
                        <img v-if="res.type == 'group'" :src="`/images/grouppic-default.png`" alt="..." class="avatar chatPic" onerror="this.src='/images/grouppic-default.png'">
                        <img v-if="res.type == 'user'" :src="`/images/${res.picName}`" alt="..." class="avatar chatPic" onerror="this.src='/images/profpic-default.jpg'">
                        <h6 class="mb-0 mt-0 ml-3">
                            {{ res.title }}
                        </h6>
                    </div>
                    <h6 class="m-0">
                        <div v-if="res.type == 'user'">
                            <i v-if="res.state == 'stable'" class="fas fa-user-check"></i>
                            <i v-else-if="res.state == 'pending'" class="fas fa-user-clock"></i>
                            <i v-else-if="res.state == 'none'" class="fas fa-user-plus"
                                :data-userId="res.userId" @click="addUser"></i>
                            <i v-else class="fas fa-user"></i>
                        </div>
                        <div v-else-if="res.type == 'group'">
                            <i v-if="res.state == 'member'" class="fas fa-user-check"></i>
                            <i v-else-if="res.state == 'pending'" class="fas fa-user-clock"></i>
                            <i v-else-if="res.state == 'not_member'" class="fas fa-user-plus"
                                :data-groupId="res.groupId" @click="addGroup"></i>
                        </div>
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
        user: Object,
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

        // Search methods
        gotSearchRes(res) {
            this.search.clear = false
            this.search.res = res
        },
        clearSearch() {
            this.search.clear = true
        },
        // rendering changes userId to userid
        async addUser(e) {
            let addedId = e.target.dataset.userid
            let data = {
                selfId: this.user.userId,
                addedId,
            }
            let res = await this.axios("/api/users/con/new", "post", data)

            if (this.handleMsg(res)) {
                let index = this.search.res.findIndex(item => item.userId == addedId)
                this.search.res[index].state = "pending"
            } 
        },
        async addGroup(e) {
            let groupId = e.target.dataset.groupid
            let data = {
                selfId: this.user.userId,
                groupId,
            }

            let res = await this.axios("/api/group/askentry", "post", data)
            
            if (this.handleMsg(res)) {
                let index = this.search.res.findIndex(item => item.groupId == groupId)
                this.search.res[index].state = "pending"
            }
        },
        handleMsg(res) {
            if (res.error || res.data.message !== "ok") {
                alert("error")
                return false
            }
            return true
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

.fas {
    font-size: 1.75em;
}
</style>

<style>
.chatPic {
    width: 50px !important;
    height: 50px !important;
    line-height: 50px !important;
}
</style>