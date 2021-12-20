const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares/user')
const {
    signup, signin, signout,
    forgotPassword, passwordReset,
    getLoggedInUserDetails, updatePassword,
    updateUser
} = require('../controllers/user.controller')

router.route('/signup').post(signup)
router.route('/signin').post(signin)
router.route('/signout').get(signout)
router.route('/userdashboard').get(isLoggedIn, getLoggedInUserDetails)
router.route('/password/update').post(isLoggedIn, updatePassword)
router.route('/userdashborad/update').put(isLoggedIn, updateUser)



module.exports = router