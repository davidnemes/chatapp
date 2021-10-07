<template>
    <div id="login" class="container">
        <header id="title" class="mb-5">
            <img src="../assets/drop.png" alt="csepp" id="drop" style="width: 20%">
            <div style="text-align: left">
                <h1><i>Chapp</i></h1>
                avagy a legjobb chat app
            </div>
        </header>
        <main>
            <h3>Bejelentkezés</h3>
            <form>
                <div class="form-group" :class="unClass">
                    <label>
                        Felhasználó:
                        <input name="username" required="true" class="form-control" placeholder="Felhasználó..." v-model="username" type="text">
                        <div class="invalid-feedback">A mező kitöltése kötelező! (min 3 karakter)</div>
                    </label>
                </div>
                <div class="form-group" :class="pwClass">
                    <label>
                        Jelszó:
                        <input name="password" required="true" class="form-control" placeholder="Jelszó..." v-model="password" type="password">
                        <div class="invalid-feedback">A mező kitöltése kötelező! (min 3 karakter)</div>
                    </label>
                </div>
                <div class="form-group">
                    <input type="checkbox" id="switch1" v-model="rememberMe">
                    <label for="switch1" class="ml-2">Jegyezz meg</label>
                </div>
                <button type="submit" class="btn btn-primary mb-2" @click="login">Belépek</button><br>
                <button type="submit" class="btn" @click="signup">Regisztrálok</button>
                <div v-if="loginErrMsg" class="form-group">
                    <p class="alert alert-danger mt-2">{{ loginErrMsg }}</p>
                </div>
            </form>
        </main>
    </div>
</template>

<script>

export default {
    name: "Login",
    data() {
        return {
            username: "",
            password: "",
            rememberMe: false,
            unClass: "",
            pwClass: "",
            loginErrMsg: "",
            cssRoot: null,
        }
    },
    methods: {
        async login(event) {
            this.loginErrMsg = ""
            event.preventDefault()

            let err = false
            if(!this.username) {
                err = true
                this.unClass = "was-validated"
            } else {
                this.unClass = ""
            }
            if (!this.password.length) {
                err = true
                this.pwClass = "was-validated"
            } else {
                this.pwClass = ""
            }
            if (err) {
                return
            }

            let data = {
                username: this.username,
                password: this.password,
                rememberMe: this.rememberMe,
            }
            let res = await this.axios("/api/users/login", "post", data)
            if (res.status == 200 && res.statusText == "OK") {
                this.handleSuccess(res)
                return
            } else if(res.error) {
                if(res.message.response.data.message == "Invalid Credentials") {
                    this.loginErrMsg = "Helytelen bejelentkezési adatok"
                }
                return
            } else {
                console.log("Exception was found!");
            }
        },
        async signup(event) {
            this.loginErrMsg = ""
            event.preventDefault()
            
            let err = false
            if(this.username.length < 3 ) {
                err = true    
                this.unClass = "was-validated"
            } else {
                this.unClass = ""
            }
            if (this.password.length < 3) {
                console.log(this.password);
                err = true    
                this.pwClass = "was-validated"
            } else {
                this.pwClass = ""
            }
            if (err) {
                return
            }

            let data = {
                username: this.username,
                password: this.password,
                rememberMe: this.rememberMe,
            }
            let res = await this.axios("/api/users/signup", "post", data)
            if (res.status == 200 && res.statusText == "OK") {
                this.handleSuccess(res)
                return
            } else if(res.error) {
                if(res.message.response.data.message == "Already reserved username") {
                    this.loginErrMsg = "A felhasználónév már foglalt"
                } else {
                    window.location.href = "/"
                }
                return
            } else {
                console.log("Exception was found!");
            }
        },
        handleSuccess(res) {
            sessionStorage.setItem("x-access-token", res.data.accessToken)
            sessionStorage.setItem("user", JSON.stringify(res.data.user))
            sessionStorage.setItem("x-acc-expiration", res.data.expiration)
            if(this.rememberMe) {
                localStorage.setItem("user", JSON.stringify(res.data.user))
                if(res.data.rememberToken) {
                    // the replaceAll method is just a bug fix
                    localStorage.setItem("x-remember-token", JSON.stringify(res.data.rememberToken).replaceAll('"', ''))
                }
            }
            this.$router.push("/home")
        },

        // CSS functions
        setCssVarValue(varName, valueToSet) {
            try {
                this.cssRoot.style.setProperty(varName, valueToSet +"px");
            } catch(err) {
                console.log(err);
                return false
            }
            return true
        },
        setCSSandHeights() {
            this.cssRoot = document.querySelector(':root')
            this.setCssVarValue("--appMT", 60)
        }
    },
    created() {
        let sstoken = sessionStorage.getItem("x-access-token")
        let lsuser = localStorage.getItem("user")
        if(lsuser || sstoken) {
            // redirect to Home.vue
            if(lsuser && !sessionStorage.getItem("user")) {
                sessionStorage.setItem("user", lsuser)
            }
            this.$router.push("/home")
        }

        // set css
        this.setCSSandHeights()
    }
}
</script>

<style>
#title {
    display: flex;
    align-items: center;
    border-bottom: 2px solid gray;
}
#drop {
    width: 20%;
}
#app {
    margin-top: val(--appMT);
}
@media screen and (max-width: 500px){
    #title {
        justify-content: center;
    }
}
@media screen and (min-width: 1000px) {
    #login {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    #title {
        border-bottom: 0;
    }
}
</style>
