const sanitizeHTML = require("sanitize-html")

const { GroupMessage, Token } = require("../db/models")
const { isJson } = require("./tools")

// MAIN CONTROLLER

const wsController = async (ws, wss, req) => {

    // Validating token
    const token = req.url.split("?token=")[1]
    if(token == req.url) {
        console.log("Unauthorized ws request came in");
        ws.send("Unauthorized")
        return ws.terminate()
    }
    let tokenFromDB = await Token.findOne({ where: {
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

// CONTROLLER FUNCTIONS

const newMessage = async (msg, ws, wss) => {
    let cleanMsg = sanitizeHTML(msg.message)
    msg.message = cleanMsg
    if (cleanMsg == "") {
        console.log("WARNING: Someone wrote html-dirty message");
        return false
    }
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

// CONNECTING


module.exports = {
    wsController
}