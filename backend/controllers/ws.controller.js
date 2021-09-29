const { WsToken, GroupMessage } = require("../db/models")

// MAIN CONTROLLER

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

    ws.on("message", (data) => {
        let msgString = data.toString()

        if(isJson(msgString)) {
            let msg = JSON.parse(msgString)
            switch(msg.type) {
                case "new_message":
                    newMessage(msg, ws, wss)
                break;
                default:
                    console.log("Exception was found:");
                    console.log(msg);
            }
        } else {
            console.log("got a string message from a connection: ");
            console.log(msg);
        }
    })
}

// CONNECTING

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

// CONTROLLER FUNCTIONS

const newMessage = async (msg, ws, wss) => {
    switch(msg.to) {
        case "group":
            try {
                await GroupMessage.create({
                    message: msg.message,
                    userId: msg.userId,
                    groupId: msg.groupId,
                    date: msg.date
                })
                wss.clients.forEach(client => {
                    // 1 is basically WebSocket.OPEN
                    if (client !== ws && client.readyState === 1) {
                        client.send(JSON.stringify(msg))
                    }
                })
            } catch (err) {
                console.log("Server Error At WS");
            }
        break;
        case "private":
            // private msg controller
        break;
        default:
            console.log("An Exception was found: ");
            console.log(msg);
    }
}

// HELPERS

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
const isJson = (data) => {
    try {
        JSON.parse(data)
        return true
    } catch (err) {
        return false
    }
}

module.exports = {
    wsController,
    wsCreateToken
}