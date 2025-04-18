const express = require('express');
const {scanWebsite} = require('../controller/analysisController');
const analysisRouter = express.Router();


analysisRouter.route('/scan').post(scanWebsite)
// analysisRouter.route('/report/:id').get(getReport)

module.exports = analysisRouter;