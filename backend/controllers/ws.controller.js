const { WsToken } = require("../db/models")

const wsController = async (ws, wss, req) => {

    // Validating token
    const token = req.url.split("?token=")[1]
    if(token == req.url) {
        console.log("Unauthorized ws request came in");
        ws.send("Unauthorized")
        return ws.terminate()
    }
    let tokenFromDB = await WsToken.findOne({ where: {
        token: token
    }})
    if (!tokenFromDB) {
        ws.send("Token not found")
        return ws.terminate()
    }
    if (tokenFromDB.expiration < Date.now()) {
        ws.send("Token expired")
        return ws.terminate()
    }

    console.log('A new client Connected!');
    ws.send('Welcome New Client!');

    ws.on("message", (message) => {
        let stringMsg = message.toString()
        let parsedMsg
        try {
            parsedMsg = JSON.parse(stringMsg)
            console.log('received: ', parsedMsg);
        } catch (err) {
            console.log('received (string) : ' + stringMsg);
        }
        wss.clients.forEach(client => {
            if (client !== ws /* && client.readyState === WebSocket.OPEN */) {
                if(parsedMsg) {
                    client.send(JSON.stringify(parsedMsg))
                } else {
                    client.send(stringMsg)
                }    
            }
        })
    })
}

// CONNECTING

function genToken() {
    var length = 6,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
const checkToken = async (token) => {
    if (token.expiration < Date.now()) {
        await WsToken.destroy({ where: {
            id: token.id
        }})
    }
}
const wsCreateToken = async (req, res) => {
    const expirationTime = Date.now() + 10 * 1000
    const token = genToken()
    try {
        await WsToken.create({
            expiration: expirationTime,
            token
        })
        res.status(200).json({ token: token })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error"})
    }

    // destroy old tokens
    try {
        let tokens = await WsToken.findAll()
        for (let i=0; i<tokens.length; i++) {
            await checkToken(tokens[i])
        }
    } catch (error) {
        console.log("Error: error at deleting old ws tokens");
        console.log(error);
    }
}


module.exports = {
    wsController,
    wsCreateToken
}