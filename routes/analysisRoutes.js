const express = require('express');
const {scanWebsite,getReport, getPdf} = require('../controller/analysisController');
const {protectRoutes} = require('../controller/authController');
const analysisRouter = express.Router();


analysisRouter.route('/scan').post(protectRoutes,scanWebsite)
analysisRouter.route('/report/:id').get(protectRoutes,getReport)
analysisRouter.route('/report/:id/pdf').get(protectRoutes,getPdf)

module.exports = analysisRouter;