const axios = require("axios")

const axiosService = async (url, method, data) => {
    let token = sessionStorage.getItem("x-access-token")
    
    let response
    let error = null
    await axios({
        url: url,
        method: method,
        data: data,
        headers: {
            "x-access-token": token 
        }
    }).then(res => response = res).catch(err => {
        error = err
    })
    if(error) {
        console.log(error.response.status);
        if(error.response.status == 401) {
            sessionStorage.clear()
            localStorage.clear()
            window.location.href = "/"
        }
        return {
            error: true,
            message: error
        }
    } else {
        return response
    }
}

module.exports = axiosService