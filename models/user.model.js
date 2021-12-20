const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minlength: [3, 'Name should be atleast 3 character long'],
        required: [true, 'First Name is required']
    },
    lastName: {
        type: String,
        minlength: [3, 'Name should be atleast 3 character long'],
        required: [true, 'Last Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password should be atleast 6 char long'],
        select: false
    },
    photo: {
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: String
}, { timestamps: true })

// hashing password before saving (pre is a hook)
userSchema.pre('save', async function (next) {
    //we can use 'this' to access any properties like name,email etc

    //only run this if password is modified
    if (!this.isModified('password')) return next()

    //hash the password
    this.password = await bcrypt.hash(this.password, 10)
})

//creating method for checking password
userSchema.methods.isValidatedPassword = async function (userPassword) {
    //gives true or false based on comparision
    return await bcrypt.compare(userPassword, this.password)
}

//creating JWT token
userSchema.methods.getJwtToken = async function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
}


// 'user' is changed to lowercase user and plural in the mongoDB document
module.exports = mongoose.model('User', userSchema)