const {promisify} = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const AppError = require('../utils/AppError');
// const email = require('../utils/email');


const signToken = id=> {
    return jwt.sign({id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}
const signup = async(req,res,next) => {
    try {
        const newUser = await User.create({
            name:req.body.name,
            email:req.body.email,
            role: req.body.role,
            password:req.body.password,
            passwordChangedAt: req.body.passwordChangedAt
        })
        const token = signToken(newUser._id)
        res.status(201).json({
            status: 'Success',
            token,
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.email
                }
            }
        })
    } catch(err) {
        return next(new AppError(err.message,409))
    }
}

const login = async(req,res,next) => {
    try {
        // get email and password
        const {email,password} = req.body;
        // check if email and password is present
        if (!email || !password) return next(new AppError('Provide email and password!',400));
        // check if email and password is valid
        const user = await User.findOne({email}).select('+password') // as password select is set to false in model
        if (!user || !(await user.comparePassword(String(password)))) {
            return next(new AppError('Incorrect email or password', 401));
        }
        // if valid sign token and send
        const token = signToken(user._id)
        res.status(200).json({
            status: 'Success',
            data: {
                token
            }
        })
    } catch(err) {
        return next(new AppError(err.message,409))
    }
}

const protectRoutes = async(req,res,next) => {
    try{
        // check if token is present
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }
        if (!token) return next(new AppError('You are not logged in! Please log in to proceed.',401))
        // verify token
        const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET_KEY)
        // check if user still exists
        const logged_user = await User.findById(decoded.id)
        if (!logged_user) {
            return next(new AppError('The user with this token doesnot exist anymore!',401))
        }
        // check if the user has recently changed password after token is issued
        if (logged_user.changedPasswordAfter(decoded.iat)) {
            return next(new AppError('Password changed after token is issued. Please login again!',401))
        }
        // GRANT ACCESS
        req.user = logged_user;
        next();
    }catch(err) {
        return next(new AppError(err.message,409))
    }
}

// route handler for forgot password
const forgotPassword = async(req,res,next)=> {
    try {
        // check if user exists
        const user = await User.findOne({email: req.body.email})
        if (!user) {
            return next(new AppError('There is no user with this email id',404))
        }
        // create reset token for the user
        const resetToken = user.createForgetPasswordToken()
        await user.save({validateBeforeSave: false})        // save encrypted resettoken and expiry time into db
        // now we will send a reset password link to user email
        const resetTokenURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;
        // set email content
        const emailContent = {
            email: user.email,
            message: `Forgot your password? Click on the link ${resetTokenURL} and reset your passoword!`,
            subject: 'The url is only active for 10 minutes'
        }
        try{
            await email(emailContent)   // send email
    
            res.status(200).json({
                status: 'Success',
                message: 'Token sent to email!'
            });
        }catch(err) {
            user.passwordResetToken=undefined
            user.passwordResetTokenExpiredAt=undefined
            await user.save({validateBeforeSave: false})
            return next(new AppError(`${err.message} Please try again later`,500))
        }

    }catch(err) {
        return next(new AppError(err.message,409))
    }
}
// route handler for reset password
// const resetPassword = async(req,res,next) => {
//     try {
//         // Get user based on token
//         const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
//         const user = await User.findOne({
//             passwordResetToken: hashedToken,
//             passwordResetTokenExpiredAt: {$gt: Date.now()}
//         })
//         if (!user) {
//             return next(new AppError('Invalid token or token expired',400))
//         }
//         // reset resettoken update password
//         user.password = req.body.password;
//         user.passwordResetToken = undefined;
//         user.passwordResetTokenExpiredAt = undefined;
//         await user.save();
//         // login the user
//         const token = signToken(user._id)
//         res.status(200).json({
//             status: 'Success',
//             'message': 'Password reset successfully!',
//             token
//         })
//     }catch(err) {
//         return next(new AppError(err.message,409))
//     }

// }
// route handler for update password (not forget password/resetpassword)
const updatePassword =async(req,res,next) => {
    try {
        // get user from collection
        const user = await User.findById(req.user._id).select('+password')
        // match the req body password with user password
        if (!await user.comparePassword(String(req.body.currentPassword))) {
            return next(new AppError('Password does not matched',404))
        }
        // if yes, update password
        user.password = req.body.updatedPassword;
        await user.save();
    
        // sign jwt token,login user
        const token = await signToken(user._id);
        res.status(200).json({
            status: 'Sucess',
            token,
            message: 'Password changed successfully!'
        })

    } catch (err) {
        return next(new AppError(err.message,409))
    }
}

module.exports={
    signup,
    login,
    protectRoutes,
    forgotPassword,
    // resetPassword,
    updatePassword
}