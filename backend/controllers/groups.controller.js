const { Group, GroupMessage, User, GroupMember } = require("../db/models")

const findAllMember = async (req, res) => {
    const id = req.params.groupId
    try {
        let messages = await Group.findOne({
            where: { id: id },
            include: {
                    model: User,
                    attributes: ['id', 'username']
            }
        })
        return res.status(200).json(messages)
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" })
    }
}

const askEntry = async (req, res) => {
    let { selfId, groupId } = req.body

    // TODO: check old membership
    // let oldMembership = await GroupMember.findOne({})

    try {
        await GroupMember.create({
            UserId: selfId,
            GroupId: groupId,
            RoleId: 1,
            status: "pending"
        })

        return res.status(200).json({ message: "ok" })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" })
    }
    
}




module.exports = {
    findAllMember,
    askEntry
}