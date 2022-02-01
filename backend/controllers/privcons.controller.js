const { PrivateConnection } = require("../db/models")

const askPermission = async (req, res) => {
    let { selfId, addedId } = req.body
    if (!parseInt(selfId) || !parseInt(addedId)) {
        return res.status(400).json({ message: "missing data" })
    }


    try {
        await PrivateConnection.create({
            userId_1: parseInt(selfId),
            userId_2: parseInt(addedId),
            status: "pending"
        })

        return res.status(200).json({ message: "ok" })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" })
    }
}

const accept = async (req, res) => {
    let { chatId } = req.body
    try {
        await PrivateConnection.update({
            status: "stable"
        },{
            where: {id: chatId}
        })

        return res.status(200).json({ message: "ok" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" })
    }
}

const reject = async (req, res) => {
    let { chatId } = req.body
    try {
        await PrivateConnection.destroy({
            where: {id: chatId}
        })

        return res.status(200).json({ message: "ok" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" })
    }
}



module.exports = {
    askPermission,
    accept,
    reject,
}