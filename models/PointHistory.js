const mongoose = require('mongoose');

const pointHistory = new mongoose.Schema({
  points: {
    type: Number,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  timestamps: {
    type: Date,
    default: Date.now,
  },
  user_id: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  points_direction: {
    type: String,
    enum: ['add', 'deduct'],
    required: true,
  },
});

module.exports = mongoose.model('PointHistory', pointHistory);
