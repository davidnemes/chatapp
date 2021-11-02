const { GroupMessage, User, PrivateMessage } = require("../db/models")

const groupFindAll = async (req, res) => {
    const id = req.params.groupId
    try {
        let messages = await GroupMessage.findAll({
            where: { groupId: id },
            include: {
                model: User,
                attributes: ["username", "id", "picName"],
                as: "User"
            }
        })
        return res.status(200).json(messages)
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" })
    }
}

const privateFindAll = async (req, res) => {
    const id = req.params.conId
    try {

        let messages = await PrivateMessage.findAll({
            where: { connectionId: id },
            include: {
                model: User,
                attributes: ["username", "id", "picName"],
                as: "User"
            }
        })

        return res.status(200).json(messages)
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" })
    }
}



module.exports = {
    groupFindAll,
    privateFindAll
}