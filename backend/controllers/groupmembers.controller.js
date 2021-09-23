const { Group, GroupMessage, User} = require("../db/models")

const findAll = async (req, res) => {
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




module.exports = {
    findAll
}