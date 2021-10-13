const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { renameSync } = require("fs")

const { User, Role, Token, GroupMember } = require("../db/models");
const { genToken } = require("./tools")

const login = async (req, res) => {

    // validating
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Empty Credentials" })
    }
    let user
    try {
        user = await User.findOne({
            where: {
                username: req.body.username
            },
            include: [{
                model: Role,
                attributes: ["role", "weight"],
                as: "Role"
            }]
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
    if (!user || user.deleted) {
        return res.status(400).json({ message: "Invalid Credentials" })
    }

    const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
    );
    if (!passwordIsValid) {
        return res.status(400).json({ message: "Invalid Credentials" })
    }

    // Remember Me

    let rmToken
    if (req.body.rememberMe) {
        rmToken = genToken()
        await Token.create({
            token: rmToken,
            expiration: Date.now() + (10*24*60*60*1000)
        })
    }

    
    // responding
    
    const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration
    });
    return res.status(200).json({
        accessToken: token,
        expiration: Date.now() + (config.jwtExpiration*1000),
        user: {
            userId: user.id,
            role: user.Role,
            username: user.username
        },
        rememberToken: rmToken
    })
}

const signup = async (req, res) => {
    // validation
    let un = req.body.username
    let pw = req.body.password
    if (!un || un.length < 3 || !pw || pw.length < 3) {
        return res.status(400).json({ message: "Too short sign-up values" })
    }

    let otherUser = await User.findOne({
        where: { username: un }
    })
    if(otherUser) {
        return res.status(400).json({ message: "Already reserved username" })
    }

    // signing up
    let user
    let encPw = await bcrypt.hash(pw, 10)
    try {
        let now = new Date()
        user = await User.create({
            username: un,
            password: encPw,
            roleId: 1,
            createdAt: now,
            updatedAt: now
        })
        await GroupMember.create({
            UserId: user.id,
            GroupId: 1
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" })
    }

    // Remember Me

    let rmToken
    if (req.body.rememberMe) {
        rmToken = genToken()
        await Token.create({
            token: rmToken,
            expiration: Date.now() + (10*24*60*60*1000)
        })
    }
    
    // responding
    let userToSend = await User.findOne({
        where: {
            username: user.username
        },
        include: [{
            model: Role,
            attributes: ["role", "weight"],
            as: "Role"
        }]
    })

    const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration
    });

    res.status(200).json({
        accessToken: token,
        expiration: Date.now() + (config.jwtExpiration*1000),
        user: {
            userId: userToSend.id,
            role: userToSend.Role,
            username: user.username
        },
        rememberToken: rmToken
    })
}

const findAll = async (req, res) => {
    try {
        let users = await User.findAll({
            attributes: ["id", "username"],
            include: {
                model: Role,
                attributes: ["role", "weight"],
                as: "Role"
            }
        })
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({ message: "Server error" })
    }
}

const changeUn = async (req, res) => {
    let { body } = req
    console.log("from body: " + body.userId);
    console.log("from accesstoken: " + req.userId);
    if (body.userId !== req.userId) {
        return res.status(400).json({ message: "Access Denied" })
    }
    let userWithName = await User.findOne({ where: { username: body.newUn } })
    if (userWithName) {
        return res.status(400).json({ message: "Already reserved username" })        
    }

    try {
        await User.update({
            username: body.newUn,
            updatedAt: new Date,
        }, { where: { id: body.userId} })
        return res.status(200).json({ updated: true })
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
}

const changePw = async (req, res) => {
    let { body } = req
    if (body.userId !== req.userId) {
        return res.status(400).json({ message: "Access Denied" })
    }

    let user
    try {
        user = await User.findOne({ where: { id: body.userId }})
    } catch (error) {
        return res.status(500).json({ message: "Server error" })
    }

    if (!user || user.deleted) {
        return res.status(400).json({ message: "Invalid Credentials" })
    }
    const passwordIsValid = bcrypt.compareSync(
        body.oldPw,
        user.password
    );
    if (!passwordIsValid) {
        return res.status(400).json({ message: "Invalid Credentials" })
    }

    let encPw = await bcrypt.hash(body.newPw, 10)
    try {
        await User.update({
            password: encPw,
            updatedAt: new Date,
        }, { where: { id: body.userId} })
        return res.status(200).json({ updated: true })
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
}

const changeProfpic = async (req, res) => {
    let { file } = req
    console.log(file);
    let extension = file.originalname.split(".").pop()
    
    let filename = `profpic-userId-${req.userId}.${extension}`
    let newpath = "public/images/" + filename
    renameSync(file.path, newpath)

    return res.status(200).json({ updated: true })
}

const deleteUser = async (req, res) => {
    let { body } = req

    let user
    try {
        user = await User.findOne({ where: { id: body.userId }})
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }

    if (!user || user.deleted) {
        return res.status(400).json({ message: "Invalid Credentials" })
    }
    const passwordIsValid = bcrypt.compareSync(
        body.pw,
        user.password
    );
    if (!passwordIsValid) {
        return res.status(400).json({ message: "Invalid Credentials" })
    }

    try {
        await User.update({
            deleted: true,
            updatedAt: new Date,
        }, { where: { id: body.userId }})
        return res.status(200).json({ updated: true })
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }

}

module.exports = {
    login,
    signup,
    findAll,
    changeUn,
    changePw,
    changeProfpic,
    deleteUser
}