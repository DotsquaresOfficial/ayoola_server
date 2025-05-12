
const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stepsConverted: {
    type: Number,
    required: true
  },
  coinsEarned: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspected', 'rejected'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  processedDate: {
    type: Date
  },
  walletAddress: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  location: {
    type: String
  }
}, { timestamps: true });

const Conversion = mongoose.model('Conversion', conversionSchema);
module.exports = Conversion;
