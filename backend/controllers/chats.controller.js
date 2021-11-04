
const { User, Group, GroupMember, Role, PrivateConnection } = require("../db/models")
const { Op } = require("sequelize")



const findAll = async (req, res) => {
    const id = req.params.userId
    
    let toClient = await userWithChats(id)

    res.status(200).json(toClient)
}

const userWithChats = async (id) => {
    // get groups
    // == userWithGroups
    let userWG = await User.findOne({
        where: { id: id },
        attributes: ["id"],
        include: {
            model: GroupMember,
            as: "Membership",
            attributes: ["id", "UserId", "GroupId"],
            include: [
                {
                    model: Group,
                    as: "Group",
                    attributes: ["id", "title", "updatedAt"],
                },{
                    model: Role,
                    as: "Role",
                    attributes: ["role", "weight"]
                }
            ]
        }
    })

    // get private connections
    let cons = await PrivateConnection.findAll({
        where: {
            [Op.or]: [
                { userId_1: id },
                { userId_2: id }
            ],
            status: "stable"
        }
    })
    for(let i = 0; i< cons.length; i++) {
        let otherId = id == cons[i].userId_1 ? cons[i].userId_2 : cons[i].userId_1
        let otherUser = await User.findOne({
            where: { id: otherId },
            attributes: ["id", "username", "picName"]
        })
        cons[i].otherUser = otherUser
    }

    // push chats to toReturn
    let toReturn = {
        userId: userWG.id,
        chats: []
    }
    userWG.Membership.forEach(ms => {
        toReturn.chats.push({
            group: true,
            type: "group",
            id: ms.Group.id,
            title: ms.Group.title,
            updatedAt: ms.Group.updatedAt,
            userRole: {
                role: ms.Role.role,
                weight: ms.Role.weight,
            }
        })
    })
    cons.forEach(con => {
        toReturn.chats.push({
            private: true,
            type: "private",
            id: con.id,
            title: con.otherUser.username,
            picName: con.otherUser.picName,
            updatedAt: con.updatedAt
        })
    })

    // sorting chats (pasted code)
    toReturn.chats.sort(function(a,b){
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    return toReturn
}

module.exports = {
    findAll,
    userWithChats
}