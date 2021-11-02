function genToken(strLength) {
    var length = parseInt(strLength) || 10,
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

// can return min, but can't return max
const random = (min, max) => {
    let k = max - min
    return Math.floor(Math.random() * k) + min
}

module.exports = {
    genToken,
    isJson,
    checkToken,
    random
}