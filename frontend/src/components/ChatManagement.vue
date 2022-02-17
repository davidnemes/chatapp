<template>
    <div class="modal fade">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Chat kezelése</h4>
                    <button type="button" class="close" @click="closeChatManagement">&times;</button>
                    <span style="display: none" data-dismiss="modal" id="closeChatManagement"></span>
                </div>
                <div class="modal-body">
                    <!-- Sidebar -->
                    <div id="sidebar">
                        <ul class="list-group" v-if="chat.type == 'group'" >
                            <li v-for="setting, index in groupSettings" 
                                :key="index"
                                @click="to(setting.action)"
                                class="list-group-item"
                                :class="setting.action == active ? 'list-group-item-primary' : ''">

                                <i class="fas" :class="setting.red ? setting.icon + ' red' : setting.icon"></i>
                                <p class="description">{{ setting.text }}</p>
                            </li>
                        </ul>
                        <ul class="list-group list-goup-flush" v-if="chat.type == 'private'" >
                            <li v-for="setting, index in privateSettings" 
                                :key="index"
                                @click="to(setting.action)"
                                class="list-group-item"
                                :class="setting.action == active ? 'list-group-item-primary' : ''">

                                <i class="fas" :class="setting.red ? setting.icon + ' red' : setting.icon"></i>
                                <p class="description">{{ setting.text }}</p>
                            </li>
                        </ul>
                    </div>
                    <!-- Content -->
                    <div id="management-content">
                        <!-- group and private actions must have different names! -->
                        <div v-if="active == 'members'">
                            <h3>Tagok</h3>
                            <ul v-if="cache.members.length > 0 && selectedUserIndex == -1" class="m-2 p-0" style="list-style-type: none">
                                <li v-for="member, index in cache.members" :key="index" class="mt-1 mb-1">
                                    <div class="flexBox">
                                        <img :src="`/images/${member.user.picName}`" alt="..." class="avatar" onerror="this.src='/images/profpic-default.jpg'">
                                        <div class="flexBox m-1 p-1">
                                            <h6 class="m-0">
                                                {{ member.user.username }}
                                            </h6>
                                            <div class="m-0 ml-2">
                                                <button class="btn btn-outline-info" @click="manageMember(member.user.id)">Kezelés</button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div v-else-if="cache.members.length > 0 && selectedUserIndex > -1" class="manageMemberDiv m-2">
                                <a @click="backFromManageMember" class="p-1 mb-2">Vissza</a>
                                <h4>{{ cache.members[selectedUserIndex].user.username }}</h4>
                                <p>{{ cache.members[selectedUserIndex].role.role }}</p>
                                <div v-if="cache.members[selectedUserIndex].user.id != user.userId">
                                    <button class="btn btn-outline-success m-1" 
                                        v-if="cache.members[selectedUserIndex].role.weight == 10 &&
                                            chat.role.weight >= 20">
                                        Moderátor jog adása</button>
                                    <button class="btn btn-outline-warning m-1" 
                                        v-if="cache.members[selectedUserIndex].role.weight == 20 &&
                                            chat.role.weight >= 20">
                                        Moderátor jog elvétele</button>
                                    <button class="btn btn-outline-danger m-1" 
                                        v-if="cache.members[selectedUserIndex].role.weight == 10 &&
                                            chat.role.weight >= 20">
                                        Törlés a csoportból</button>
                                </div>
                            </div>
                            <div v-else>
                                <p class="alert alert-warning m-2">Töltés...</p>
                            </div>
                        </div>
                        <div v-else-if="active == 'group'">
                            <h3>A csoport beállításai</h3>
                            
                            <h4>A csoport neve</h4>

                        </div>
                        <div v-else-if="active == 'new_member'">
                            <h3>Új tag meghívása</h3>
                        </div>
                        <div v-else-if="active == 'exit'">
                            <h3>Kilépés a csoportból</h3>
                        </div>
                        <div v-else-if="active == 'ban'">
                            <h3>Beszélgetés letiltása</h3>
                        </div>
                        <div v-else>
                            <p style="color: lightgray">
                                Válassz a beállítási lehetőségek közül
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
    
<script>
export default {
    name: "ChatManagement",
    props: {
        chat: Object,
        user: Object,
    },
    data() {
        return {
            groupSettings: [
                {action: "members", icon: "fa-users", text: "Tagok"},
                {action: "group", icon: "fa-cog", text: "Csoport"},
                {action: "new_member", icon: "fa-user-plus", text: "Új tag"},
                {action: "exit", icon: "fa-sign-out-alt", text: "Kilépés", red: true},
            ],
            privateSettings: [
                {action: "ban", icon: "fa-ban", text: "Tiltás", red: true},
            ],
            active: "",
            // cache for setting informations
            cache: {
                members: []
            },
            selectedUserIndex: -1,
        }
    },
    methods: {
        to(where) {
            this.active = where
            if (this.cache[where] == undefined || this.cache[where].length == 0) {
                switch(where) {
                    case "members":
                        this.getMembers()
                        break
                }
            }
        },
        async getMembers() {
            let res = await this.axios("/api/group/members/"+this.chat.id)
            if (res.error) return this.handleError(res)
            let ready = []
            res.data.forEach(member => {
                ready.push({
                    user: member.User,
                    role: member.Role
                })
            });
            this.cache.members = ready
        },
        manageMember(userId) {
            let index = this.cache.members.findIndex(k => k.user.id == userId)
            this.selectedUserIndex = index
        },
        backFromManageMember() {
            this.selectedUserIndex = -1
        },
        // needed an helper function to clear things
        closeChatManagement() {
            this.active = ""
            this.cache.members = []
            this.selectedUserIndex = -1
            this.jQuery("#closeChatManagement")[0].click()
        },
        handleError(res) {
            res
            alert("error")
        }
    }
}
</script>
<style scoped>
.modal-body {
    display: flex;
}
#sidebar {
    width: 25%;
}
#management-content {
    width: 75%;
    height: calc(var(--innerHeight) -200px);
    overflow-y: scroll;
}
.manageMemberDiv {
    text-align: left;
}
.red {
    color: red !important;
}
.list-group-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
}
p {
    margin: 0;
}

@media screen and (max-width: 600px) {
    .list-group-item {
        justify-content: center;
    }
}
</style>