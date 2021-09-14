import VueRouter from "vue-router"

import Login from '../components/Login.vue'
import PageNotFound from "../components/404.vue"
import Home from "../components/Home.vue"

const routes = [
    {
        path: "/",
        redirect: "/login"
    },
    {
        path: "/login",
        component: Login
    },
    {
        path: "/home",
        component: Home
    },
    // 404 is handled on backend in production
    {
        path: "*",
        component: PageNotFound
    }
]

const router = new VueRouter({
    // short for routes: routes
    routes,
    mode: "history"
})

export default router