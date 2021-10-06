function genToken() {
    var length = 10,
    // you shouldn't put the " charachter in
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

const isJson = (data) => {
    try {
        JSON.parse(data)
        return true
    } catch (err) {
        return false
    }
}

const checkToken = (token) => {
    if (token.expiration < Date.now()) {
        return false
    } else {
        return true
    }
}

module.exports = {
    genToken,
    isJson,
    checkToken
}