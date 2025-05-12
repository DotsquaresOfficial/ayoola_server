
const mongoose = require('mongoose');

const pointStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  earned: {
    type: Number,
    default: 0
  },
  converted: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index to ensure unique dates
pointStatsSchema.index({ date: 1 }, { unique: true });

const PointStats = mongoose.model('PointStats', pointStatsSchema);
module.exports = PointStats;
