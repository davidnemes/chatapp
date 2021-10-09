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
                        <option value="delete"><span style="color: #cc3300;">Profil törlése</span></option>
                    </select>
                    <form v-if="userAction">
                        <div v-if="userAction == 'username'">
                            <div class="form-group">
                                <label>
                                    {{ textToUn }} <br>
                                    <input type="text" class="form-control" v-model="unInput">
                                </label>
                            </div>
                        </div>
                        <div v-if="userAction == 'password'">
                            <p class="alert alert-secondary">Jelszavad megváltoztatásához meg kell adnod az előző jelszavadat is</p>
                            <div class="form-group">
                                <label>
                                    Jelenlegi jelszavad: <br>
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
                                    <input accept="image/*" id="profpicInput" class="alert alert-dark" type="file">
                                </label>
                            </div>
                        </div>
                        <button class="btn btn-primary mb-2" @click="formSubmitted" :disabled="disabled">Megerősít</button>
                        <p class="alert alert-danger" v-if="alert !== '' && alert">{{ alert }}</p>
                        <p class="alert alert-success" v-if="success !== '' && success">{{ success }}</p>
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
            alert: "",
            success: "",
            process: false,
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
                return "Jelenlegi felhasználóneved: "
            } else {
                return "Új felhasználóneved: "
            }
        },
        disabled() {
            if (this.userAction == "username" && this.textToUn !== "Új felhasználóneved: ") {
                return true
            } else if(this.process) {
                return true
            } else {
                return false
            }
        }
    },
    methods: {
        seePw(event) {
            let input = this.jQuery(event.target.parentElement).find("input")[0]
            let currentType = input.type
            input.type = currentType == "password" ? "text" : "password"
        },

        async formSubmitted(e) {
            e.preventDefault()
            this.alert = ""
            this.process = true
            switch(this.userAction) {
                case "profpic":
                    await this.changeProfpic()
                break
                case "username":
                    await this.changeUn()
                break
                case "password":
                    await this.changePw()
                break
                case "delete":
                
                break
                default:
                    alert("An Exception was found")
            }
            this.process = false
            setTimeout(() => {
                this.success = ""
            }, 8000);
        },
        // To Server
        async changeUn() {
            if (this.user.username == this.unInput) {
                this.alert = "A felhasználóneved nem változott"
                return
            }
            if (!this.unInput || this.unInput.length < 3) {
                this.alert = "Túl rövid felhasználónév"
                return
            }

            let toServer = {
                userId: this.user.userId,
                newUn: this.unInput,
            }
            let res = await this.axios("/api/users/newun", "post", toServer)
            if (res.error) {
                let err = res.message
                if (err.response.message == "Already reserved username") {
                    this.alert = "A felhasználónév már foglalt"
                } else {
                    this.alert = "Szerver error"
                }
                return
            }

            let user = this.user
            user.username = this.unInput
            let str = JSON.stringify(user)
            localStorage.setItem("user", str)
            sessionStorage.setItem("user", str)

            this.success = "Felhasználóneved módosult"
        },
        async changeProfpic() {
            let input = this.jQuery("#profpicInput")
            if (input.files.length > 1) {
                this.alert = "Csak egy képet tudsz feltölteni"
            }

            let toServer = new FormData()
            toServer.append("profpic", input.files[0])
            let res = await this.axios("/api/users/newprofpic", "post", toServer, { multipart: true })

            if (res.error) {
                let err = res.message
                if (err.status == 500) {
                    this.alert = "Szerver Error"
                } else {
                    this.alert = "Error"
                }
                return
            }

            this.success = "A profilképed be lett állítva."
        },
        async changePw() {
            if (this.oldPw.length < 3 || this.newPw.length < 3 ) {
                this.alert = "Túl rövidek a jelszavak"
                return
            }
            if (this.newPw !== this.newPwAgain) {
                this.alert = "A két új jelszó nem egyezik meg"
                return
            }

            let toServer = {
                oldPw: this.oldPw,
                newPw: this.newPw,
                userId: this.user.userId
            }
            let res = await this.axios("/api/users/newpw", "post", toServer)
            if (res.error) {
                let err = res.message
                if (err.status == 500) {
                    this.alert = "Szerver Error"
                } else {
                    this.alert = "Error"
                }
                return
            }

            this.success = "Új jelszavad be lett állítva."
        }
    },
    created() {
        this.unInput = this.user.username
    }
}
</script>
