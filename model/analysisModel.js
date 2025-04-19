const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    code: {
      type: String
    },
    type: {
      type: String,
      enum: ['error', 'warning', 'notice']
    },
    typeCode: {
      type: Number
    },
    message: {
      type: String
    },
    context: {
      type: String
    },
    selector: {
      type: String
    }
  }, { _id: false }); 

const analysisSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    issues: {
        type: [issueSchema],
        default: []
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
})

const Analytics = new mongoose.model('Analytics',analysisSchema)
module.exports = Analytics;