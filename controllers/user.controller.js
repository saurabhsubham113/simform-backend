const User = require('../models/user.model')
const createResult = require('../utils/responseHandler')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary')

//signup
exports.signup = async (req, res) => {
    try {
        let result;
        //if files exist in the request
        if (req.files) {
            let file = req.files.photo

            result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "users",
                width: 150,
                crop: "scale"
            })
        }
        //destructrig body
        const { firstName, lastName, email, password } = req.body
        // if the params not exist throw an error
        if (!email || !firstName || !lastName || !password) {
            throw new Error("firstname,lastname,email,password are required")
        }
        //creating user in the DB
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
        //getting token
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

//signout 
exports.signout = (req, res) => {

    req.user = null
    req.token = null
    res.status(200).send(createResult(null, 'Logout Successful'))
}

//getting the user details of logged in user
exports.getLoggedInUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        res.status(200).send(createResult(null, user))
    } catch (error) {
        res.status(500).send('something went wrong')
    }
}

//updating the pasword
exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.id

        const user = await User.findById(userId).select("+password")//we have password select false
        //checking if old password is correct
        const isCorrectOldPassword = await user.isValidatedPassword(req.body.oldPassword)
        
        if (!isCorrectOldPassword) throw new Error('old password is incorrect')
        //adding the new password in the user obj
        user.password = req.body.newPassword

        await user.save()

        const token = await user.getJwtToken()
        user.password = undefined
        res.status(200).send(createResult(null, { user, token }))
    } catch (error) {
        res.status(400).send(createResult(error.message))
    }
}

//updating user
exports.updateUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body
    try {
        if (!firstName || !lastName || !email) throw new Error('name and email  is required')
        const userId = req.user.id
        let newData = {
            firstName,
            lastName,
            email,
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
            //adding data in the newData obj
            newData.photo = {
                id: result.public_id,
                secure_url: result.secure_url
            }
        }
        //finding user and updating it
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
