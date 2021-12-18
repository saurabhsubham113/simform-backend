const User = require('../models/user.model')
const createResult = require('../utils/responseHandler')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary')
const crypto = require('crypto')

//signup
exports.signup = async (req, res) => {
    try {
        let result;
        if (req.files) {
            let file = req.files.photo

            result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "users",
                width: 150,
                crop: "scale"
            })
        }
        const { firstName, lastName, email, password } = req.body
        if (!email || !firstName || !lastName || !password) {
            throw new Error("firstname,lastname,email,password are required")
        }
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            photo: {
                id: result.public_id,
                secure_url: result.secure_url
            }
        })
        const token = await user.getJwtToken()
        user.password = undefined
        res.status(200).send(createResult(null, { user, token }))

    } catch (error) {
        res.status(400).send(createResult(error.message))
    }

}

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body
        //check if email or password is available
        if (!email || !password) throw new Error('Email and password are required')

        const user = await User.findOne({ email }).select("+password")//we have password select false
        //no user found
        if (!user) throw new Error('No registered user found')
        //matching the passoword
        const isValidPassword = await user.isValidatedPassword(password)
        //if password not match
        if (!isValidPassword) throw new Error("email or password is incorrect")

        const token = await user.getJwtToken()
        user.password = undefined
        res.status(200).send(createResult(null, { user, token }))

    } catch (error) {
        res.status(400).send(createResult(error.message))
    }
}

exports.signout = (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    }).status(200).send(createResult(null, 'Logout Successful'))
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).send(createResult('Email is required'))

        const user = await User.findOne({ email })

        if (!user) return res.status(400).send(createResult('user is not registered'))
        const forgotToken = user.getForgotPasswordToken()

        await user.save({ validateBeforeSave: false })

        const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

        const message = `copy and paste this usl in a brpwser to change your password \n\n ${myUrl}`

        await emailHelper({
            email: user.email,
            subject: "E-com: Password reset link",
            message
        })

        res.status(200).send(createResult(null, 'Email sent successfully'))
    } catch (error) {

        //if something went wrong flush the value before
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({ validateBeforeSave: false })

        res.status(500).send(createResult(error.message))
    }
}

exports.passwordReset = async (req, res) => {
    try {
        const token = req.params.token
        const encryptedToken = crypto.createHash('sha256').update(token).digest('hex')

        const user = await User.findOne({
            forgotPasswordToken: encryptedToken,
            //expiry should be greater than the current date
            forgotPasswordExpiry: { $gt: Date.now() }
        })

        if (!user) throw new Error('Token is invalid or expired')

        user.password = req.body.password
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save()

        // const token = await user.getJwtToken()
        user.password = undefined
        res.status(200).send(createResult(null, { user, token }))

    } catch (error) {
        res.status(400).send(createResult(error.message))
    }
}

exports.getLoggedInUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        res.status(200).send(createResult(null, user))
    } catch (error) {
        res.status(500).send('something went wrong')
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.id

        const user = await User.findById(userId).select("+password")

        const isCorrectOldPassword = await user.isValidatedPassword(req.body.oldPassword)

        if (!isCorrectOldPassword) throw new Error('old password is incorrect')

        user.password = req.body.newPassword

        await user.save()

        const token = await user.getJwtToken()
        user.password = undefined
        res.status(200).send(createResult(null, { user, token }))
    } catch (error) {
        res.status(400).send(createResult(error.message))
    }
}

exports.updateUser = async (req, res) => {
    const { firstName, lastName, email } = req.body
    try {
        if (!firstName || !lastName || !email) throw new Error('name and email is required')
        const userId = req.user.id
        let newData = {
            firstName,
            lastName,
            email
        }
        if (req.files) {
            const imageId = req.user.photo.id

            //delete photo on cloudinary
            await cloudinary.v2.uploader.destroy(imageId)

            const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
                folder: "users",
                width: 150,
                crop: "scale"
            })

            newData.photo = {
                id: result.public_id,
                secure_url: result.secure_url
            }
        }

        const user = await User.findByIdAndUpdate(userId, newData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })

        res.status(201).send(createResult(null, user))
    } catch (error) {
        res.status(400).send(createResult(error.message))
    }
}
