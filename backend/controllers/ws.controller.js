const sanitizeHTML = require("sanitize-html")

const { GroupMessage, Group, Token } = require("../db/models")
const { isJson } = require("./tools")
const { userWithChats } = require("./chats.controller")

// MAIN CONTROLLER

const wsController = async (ws, wss, req) => {

    // Validating token
    let token
    let userId
    try {
        const queries = req.url.split("?")[1].split("&")
        token = queries[0].split("token=")[1]
        userId = queries[1].split("id=")[1]
    } catch (err) {
        console.log("WS -> got connection with poor authorization");
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

    // New connection
    console.log('WS -> A new client Connected!');
    ws.send('Welcome New Client!');
    ws.userId = userId
    ws.chats = (await userWithChats(userId)).chats

    // Listening for messages
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
            console.log("WS -> got a string message from a connection: ");
            console.log(msg);
        }
    })
}

// CONTROLLER FUNCTIONS

const newMessage = async (msg, ws, wss) => {
    // validate message
    let cleanMsg = sanitizeHTML(msg.message)
    msg.message = cleanMsg
    if (cleanMsg == "") {
        console.log("WS -> WARNING: Someone wrote html-dirty message");
        return false
    }

    // handle message
    switch(msg.to) {
        case "group":
            try {
                await GroupMessage.create({
                    message: msg.message,
                    userId: msg.userId,
                    groupId: msg.chatId,
                    date: msg.date
                })
                await Group.update({
                    updatedAt: msg.date,
                    // had to update stg else too, only updatedAt didn't work
                    id: msg.chatId
                }, { where: {id: msg.chatId} })
                wss.clients.forEach(client => {
                    // 1 is basically WebSocket.OPEN
                    if (client == ws || client.readyState !== 1) return
                    
                    // check if user is a member of this group
                    let isMember = false
                    client.chats.forEach(chat => {
                        if (chat.group == true && chat.id == msg.chatId) isMember = true
                    })
                    if (isMember) client.send(JSON.stringify(msg))
                })
            } catch (err) {
                console.log("WS -> Server Error");
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

module.exports = {
    wsController
}