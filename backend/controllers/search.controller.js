
const { User, Group, GroupMember, PrivateConnection } = require("../db/models")
const { Op } = require("sequelize")

const findFull = async (req, res) => {
    // get datas
    let value = req.body.val.toLowerCase()
    let users = await User.findAll({ attributes: ["id", "username", "picName"]})
    let groups = await Group.findAll({ where: { isPrivate: false } })
    
    // start search
    let results = []
    users.forEach(u => {
        let points = compare(value, u.username.toLowerCase())
        if (points < 1) {
            return
        }

        results.push({
            type: "user",
            title: u.username,
            picName: u.picName,
            userId: u.id,
            accuracy: points,
        })
    });
    groups.forEach(g => {
        let points = compare(value, g.title.toLowerCase())
        if (points < 1) {
            return
        }

        results.push({
            type: "group",
            title: g.title,
            groupId: g.id,
            accuracy: points,
        })
    });
    if (results.length == 0) {
        return res.status(200).json([])
    }

    // sort results
    results.sort((a,b) => {
        return b.accuracy - a.accuracy
    })

    // include connection state
    for (let i = 0; i < results.length; i++) {
        switch (results[i].type) {
            case "user":
                if (req.userId == results[i].userId) {
                    results[i].state = "self"
                    continue
                }
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

const compare = (value, target) => {
    let val = value
    let targ = target
    // normalize
    let max = val.length > targ.length ? val.length : targ.length
    for (let i = 0; i < max; i++) {
        normalize.forEach(rule => {
            if (rule.old.includes(val[i])) {
                val = replaceAt(val, i, rule.new)
            }
            if (rule.old.includes(targ[i])) {
                targ = replaceAt(targ, i, rule.new)
            }
        })
    }
    // INSPECTIONS
    // complete accuracy
    if (targ == val) return 10

    // target include value
    if (targ.includes(val)) return 9

    // value includes target
    if (val.includes(targ)) return 8

    // letter match
    let lettersOK = {
        ok: 0,
        inc: 0,
    }
    for (let i = 0; i < val.length; i++) {
        if (targ[i] == val[i]) {
            lettersOK.ok += 1
            continue
        }

        if (targ.includes(val[i])) lettersOK.inc += 1
    }
    let okPercentage = parseInt((lettersOK.ok / val.length) *100)
    if (okPercentage < 20 && lettersOK.inc < 2) {
        return 0
    }
    return (okPercentage/10) + (lettersOK.inc * 0.25)
}

// HELPERS
const normalize = [
    { old: ['á', 'à'], new: "a"},
    { old: ['é', 'è'], new: "e"},
    { old: ['ì', 'í'], new: "i"},
    { old: ['ö', 'ő', 'õ', 'ó', 'ò'], new: "o"},
    { old: ['ü', 'ű', 'ù', 'ú'], new: "u"},

]
const replaceAt = (string, index, replacement) => {
    return string.substr(0, index) + replacement + string.substr(index + replacement.length);
}


module.exports = {
    findFull,
    compare
}