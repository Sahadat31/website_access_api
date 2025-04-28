const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const analysisRouter = require('./routes/analysisRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/AppError');

if (process.env.NODE_ENVIRONMENT==='development') {
    app.use(morgan('dev'))
}
const corsOptions ={
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(express.json())

// mounting the routers
app.use('/api/v1/analysis',analysisRouter)
app.use('/api/v1/user',userRouter)

// if till now no route handlers catches it then its an undefined route
app.all('*',(req,res,next)=> {
    const err = new AppError(`Can't find this route ${req.originalUrl} on this server!!!`,404)
    next(err);      // it will call the error handler middleware this way
})
// error handler route
app.use(globalErrorHandler)

module.exports = app;

