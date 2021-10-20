
const { User, Group } = require("../db/models")


const findAll = async (req, res) => {
    const id = req.params.userId
    
    let toClient = await userWithChats(id)

    res.status(200).json(toClient)
}

const userWithChats = async (id) => {
    let user = await User.findOne({
        where: { id: id },
        attributes: ["id"],
        include: {
            model: Group,
            attributes: ["id", "title", "updatedAt"],
            order: [
                ['updatedAt', 'ASC']
            ]
        }
    })

    let toReturn = {
        userId: user.id,
        chats: []
    }
    user.Groups.forEach(group => {
        toReturn.chats.push({
            group: true,
            id: group.id,
            title: group.title,
            updatedAt: group.updatedAt
        })
    })
    return toReturn
}

module.exports = {
    findAll,
    userWithChats
}