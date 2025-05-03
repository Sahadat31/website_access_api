const User = require('../model/userModel');
const AppError = require('../utils/AppError');

const searchHistory = async(req,res,next) => {
    try {
        res.status(200).json({
            status: "Success",
            data: {
                history: req.user.requestedIdArray
            }
        })
    } catch(err) {
        return next(new AppError(err.message,502))
    }
}

module.exports = {
    searchHistory
}