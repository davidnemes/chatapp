<template>
    <div class="modal fade">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Chat kezelése</h4>
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Sidebar -->
                    <div id="sidebar">
                        <ul class="list-group" v-if="chat.type == 'group'" >
                            <li v-for="setting, index in groupSettings" 
                                :key="index"
                                @click="to(setting.action)"
                                class="list-group-item"
                                :class="setting.action == currAction ? 'list-group-item-primary' : ''">

                                <i class="fas" :class="setting.red ? setting.icon + ' red' : ''"></i>
                                <p class="description">{{ setting.text }}</p>
                            </li>
                        </ul>
                        <ul class="list-group list-goup-flush" v-if="chat.type == 'private'" >
                            <li v-for="setting, index in groupSettings" 
                                :key="index"
                                @click="to(setting.action)"
                                class="list-group-item"
                                :class="setting.action == currAction ? 'list-group-item-primary' : ''">

                                <i class="fas" :class="setting.red ? setting.icon + ' red' : setting.icon"></i>
                                <p class="description">{{ setting.text }}</p>
                            </li>
                        </ul>
                    </div>
                    <!-- Content -->
                    <div id="management-content">

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
            active: ""
        }
    },
    computed: {
        currAction() {
            if (this.active !== "") return this.active
            if (this.chat.type == "group") return this.groupSettings[0].action
            if (this.chat.type == "private") return this.privateSettings[0].action

            return "error"
        }
    },
    methods: {
        to(where) {
            console.log(where);
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