const jwt = require('jsonwebtoken')
const createResult = require('../utils/responseHandler')
const User = require('../models/user.model')

//middlewre to check if user is logged in
exports.isLoggedIn = async (req, res, next) => {
    try {
        // if there is not authorization token throw an error
        if (!req.header("Authorization")) {
            throw new Error('Auth token required')
        }
        // removing the bearer in the token 
        const token = req.header("Authorization").replace("Bearer ", "")
        //decoding the token
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decode.id)
        //if no user found then user have not been authenticated
        if (!user) {
            throw new Error("Authentication failed")
        }
        // setting token and user in the req obj
        req.user = user
        req.token = token
        next()
    } catch (error) {
        return res.status(401).send(createResult(error.message))
    }

}
