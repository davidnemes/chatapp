const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

const { Token } = require("../db/models")
const { genToken, checkToken } = require("./tools")


const newAccessToken = async (req, res) => {
    switch(req.body.reason) {
        case "remember_me":
            console.log("remember me -> asked for new acctoken");
            let { user, token } = req.body
            if(!user || !token) {
                return res.status(400).json(JSON.stringify({ message: "Data missing" }))
            }
            
            let dbToken = await Token.findOne({ where: { token } })
            if(!dbToken) {
                console.log("db token not found");
                return res.status(401).json(JSON.stringify({ message: "Token not found" }))
            }
            if(!checkToken(dbToken)) {
                console.log("db token expired");
                return res.status(401).json(JSON.stringify({ message: "Token expired" }))
            }

            // rewrite expiration

            await Token.update({
                expiration: Date.now() + (30*24*60*60*1000)
            }, {
                where: { token: token },
            })

            // responding
            
            const accessToken = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: config.jwtExpiration
            });

            let response = {
                accessToken,
            }
            return res.status(200).json(JSON.stringify(response))
        break
        case "token_expired":
            // when 2h off
        break
        default:
            return req.status(400).json(JSON.stringify({ message: "Request was not excepted" }))
    }
}

const wsCreateToken = async (req, res) => {
    const expirationTime = Date.now() + 10 * 1000
    const token = genToken()
    try {
        await Token.create({
            expiration: expirationTime,
            token
        })
        res.status(200).json({ token: token })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error"})
    }

    // destroy old tokens
    try {
        let tokens = await Token.findAll()
        for (let i=0; i<tokens.length; i++) {
            if(!checkToken(tokens[i])) {
                await Token.destroy({ where: {
                    id: tokens[i].id
                }})
            }
        }
    } catch (error) {
        console.log("Error: error at deleting old ws tokens");
        console.log(error);
    }
}

module.exports = {
    newAccessToken,
    wsCreateToken
}