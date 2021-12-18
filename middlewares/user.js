const jwt = require('jsonwebtoken')
const createResult = require('../utils/responseHandler')
const User = require('../models/user.model')

exports.isLoggedIn = async (req, res, next) => {
    try {
        if (!req.header("Authorization")) {
            throw new Error('Auth token required')
        }
        const token = req.header("Authorization").replace("Bearer ", "")

        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decode.id)

        if (!user) {
            throw new Error("Authorization failed")
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        return res.status(401).send(createResult(error.message))
    }

}
