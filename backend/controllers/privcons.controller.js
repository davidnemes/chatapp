const { PrivateConnection } = require("../db/models")

const askPermission = async (req, res) => {
    let { selfId, addedId } = req.body
    if (!parseInt(selfId) || !parseInt(addedId)) {
        return res.status(400).json({ message: "missing data" })
    }

    // TODO: check old membership
    // let oldMembership = await GroupMember.findOne({})

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





module.exports = {
    askPermission
}