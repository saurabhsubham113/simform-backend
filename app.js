const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const app = express()
if (process.env.NODE_ENV !== 'production') {
    const morgan = require('morgan')
    //logging information
    app.use(morgan('dev'))
}
//express can handle the incoming json response
app.use(express.json())

//handling the encoded url
app.use(express.urlencoded({ extended: true }))

//file upload
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/temp/'
}))
//cors
app.use(cors('*'))



//importing all routes
const userRoute = require('./routes/user.route')


app.use('/api/v1', userRoute)

module.exports = app