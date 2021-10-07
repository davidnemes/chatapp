const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { User, Role, Token } = require("../db/models");
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
    if (!user) {
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
        user = await User.create({
            username: un,
            password: encPw,
            roleId: 1,
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

module.exports = {
    login,
    signup,
    findAll
}