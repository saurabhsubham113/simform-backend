# Simform Assignment!

Working Url: [simform-backend](https://simform-backend.herokuapp.com/api/v1/)
Instead of AWS S3 I have used Cloudinary for Image Upload. The configuration are as belows.

# Configuration

- unzip the folder.
- Create a `.env` file in the root of the folder.
- Mongo uri is the mongoDB Url
- Create an account on cloudinary for the image upload.
- Paste the following configuration.
- `MONGO_URI=`
- `JWT_SECRET=`
- `JWT_EXPIRY=3d`
- `CLOUDINARY_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

# Steps to run the application

- open terminal in the folder location.
- run `npm install`
- After successfull installation run `npm run dev`

## Routes

[signup](https://simform-backend.herokuapp.com/api/v1/signup).{`METHOD: POST` required fileds: firstName,lastName,email,password,photo}
[signin](https://simform-backend.herokuapp.com/api/v1/signin).{`METHOD: POST` required fields: email: test@mail.com, password: test1234}
[userdashboard](https://simform-backend.herokuapp.com/api/v1/userdashboard).{`METHOD: GET` }
[user-update](https://simform-backend.herokuapp.com/api/v1/userdashborad/update).{`METHOD: PUT` required fileds: firstName,lastName,email,photo}
[password-update](https://simform-backend.herokuapp.com/api/v1/password/update).{`METHOD: POST` required fileds: oldPassword,newPassword}
