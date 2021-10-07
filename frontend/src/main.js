import Vue from 'vue'
import VueRouter from "vue-router"
import App from './App.vue'
import router from "./routes/router"

import $ from 'jquery/dist/jquery.min.js'
Vue.prototype.jQuery = $
import axiosService from './axios_service/service'
Vue.prototype.axios = axiosService

import 'jquery/src/jquery'
import 'bootstrap/dist/js/bootstrap.min.js'
import 'bootstrap/dist/css/bootstrap.min.css'

Vue.use(VueRouter)

Vue.config.productionTip = false

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app')
