const express = require('express');
const morgan = require('morgan');
const app = express();
const analysisRouter = require('./routes/analysisRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/AppError');

if (process.env.NODE_ENVIRONMENT==='development') {
    app.use(morgan('dev'))
}
app.use(express.json())

// mounting the routers
app.use('/api/v1/analysis',analysisRouter)
app.use('/api/v1/users',userRouter)

// if till now no route handlers catches it then its an undefined route
app.all('*',(req,res,next)=> {
    const err = new AppError(`Can't find this route ${req.originalUrl} on this server!!!`,404)
    next(err);      // it will call the error handler middleware this way
})
// error handler route
app.use(globalErrorHandler)

module.exports = app;

