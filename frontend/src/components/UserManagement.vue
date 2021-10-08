<template>
    <div class="modal fade">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Felhasználó kezelése</h4>
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Mit szeretnél tenni?</p>
                    <select v-model="userAction" class="p-2 alert alert-info">
                        <option value=""></option>
                        <option value="profpic">Profilkép kezelése</option>
                        <option value="username">Felhasználónév kezelése</option>
                        <option value="password">Jelszó kezelése</option>
                        <option value="delete">Profil törlése</option>
                    </select>
                    <form v-if="userAction">
                        <div v-if="userAction == 'username'">
                            <div class="form-group">
                                <label>
                                    Jelenlegi felhasználóneved: <br>
                                    <input type="text" class="form-control" v-model="unInput">
                                </label>
                            </div>
                        </div>
                        <div v-if="userAction == 'password'">
                            <p class="alert alert-secondary">Jelszavad megváltoztatásához meg kell adnod az előző jelszavadat is</p>
                            <div class="form-group">
                                <label>
                                    {{ textToUn }} <br>
                                    <input type="password" class="form-control" placeholder="Jelszó..." v-model="oldPw">
                                </label>
                                <i class="ml-2 fas fa-lock" @click="seePw"></i>
                            </div>
                            <div class="form-group">
                                <label>
                                    Új jelszavad: <br>
                                    <input type="password" class="form-control" placeholder="Jelszó..." v-model="newPw">
                                </label>
                                <i class="ml-2 fas fa-lock" @click="seePw"></i>
                            </div>
                            <div class="form-group">
                                <label>
                                    Új jelszavad mégegyszer: <br>
                                    <input type="password" class="form-control" placeholder="Jelszó..." v-model="newPwAgain">
                                </label>
                                <i class="ml-2 fas fa-lock" @click="seePw"></i>
                            </div>
                        </div>
                        <div v-if="userAction == 'profpic'">
                            <p class="alert alert-secondary">Állíts be magadnak egy profilképet, amiről megismerhetnek</p>                                
                            <div class="form-group">
                                <label>
                                    <input accept="image/*" class="alert alert-dark" type="file">
                                </label>
                            </div>
                        </div>
                        <button class="btn btn-primary">Megerősít</button>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-dismiss="modal">Mégse</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
// This component is a modal

export default {
    name: "UserManagement",
    data() {
        return {
            userAction: "",
            unInput: "",
            oldPw: "",
            newPw: "",
            newPwAgain: "",
            // helper for unInput
            first: true
        }
    },
    computed: {
        user() {
            if (sessionStorage.getItem("user")) {
                return JSON.parse(sessionStorage.getItem("user"))
            } else {
                return { userId: 0, username: "default", role: { role: "user", weight: 10 }}
            }
        },
        textToUn() {
            if (this.unInput == this.user.username) {
                return "Jelenlegi jelszavad: "
            } else {
                return "Új jelszavad: "
            }
        }
    },
    methods: {
        seePw(event) {
            let input = this.jQuery(event.target.parentElement).find("input")[0]
            let currentType = input.type
            input.type = currentType == "password" ? "text" : "password"
        }
    },
    created() {
        this.unInput = this.user.username
    }
}
</script>
