const express = require('express');
const {signup,login,forgotPassword,updatePassword,protectRoutes} = require('../controller/authController')
const userRouter = express.Router();

userRouter.post('/signup',signup)
userRouter.post('/login',login)
userRouter.post('/forgotpassword',forgotPassword)
// userRouter.patch('/resetpassword/:token',resetPassword)
userRouter.patch('/updatePassword',protectRoutes,updatePassword)

module.exports = userRouter;