
const { User, Group, GroupMember, PrivateConnection } = require("../db/models")
const { Op } = require("sequelize")

const findFull = async (req, res) => {
    let value = req.body.val.toLowerCase()
    let users = await User.findAll({ attributes: ["id", "username", "picName"]})
    let groups = await Group.findAll({ where: { isPrivate: false } })
    
    let results = []
    users.forEach(u => {
        if (u.username.toLowerCase() == value) {
            results.push({
                type: "user",
                title: u.username,
                picName: u.picName,
                userId: u.id,
            })
        }
    });
    groups.forEach(g => {
        if (g.title.toLowerCase() == value) {
            results.push({
                type: "group",
                title: g.title,
                groupId: g.id,
            })
        }
    });
    if (results.length == 0) {
        return res.status(200).json([])
    }


    for (let i = 0; i < results.length; i++) {
        switch (results[i].type) {
            case "user":
                let con = await PrivateConnection.findOne({ where: {
                    [Op.or]: [
                        { userId_1: req.userId,
                        userId_2: results[i].userId },
                        { userId_1: results[i].userId,
                        userId_2: req.userId}
                    ]
                }})
                let state = con ? con.status : "none"
                results[i].state = state
                break;
            case "group":
                let member = await GroupMember.findOne({where: {
                    userId: req.userId,
                    groupId: results[i].groupId
                }})
                results[i].state = member ? "member" : "not_member"
                break;
        }
        
    }
    
    res.status(200).json(results)
}


module.exports = {
    findFull
}