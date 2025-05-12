
const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  newUsers: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index to ensure unique dates
userStatsSchema.index({ date: 1 }, { unique: true });

const UserStats = mongoose.model('UserStats', userStatsSchema);
module.exports = UserStats;
