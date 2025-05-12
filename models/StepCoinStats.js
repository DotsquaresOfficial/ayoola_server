
const mongoose = require('mongoose');

const stepCoinStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  marketCap: {
    type: Number,
    required: true
  },
  circulatingSupply: {
    type: Number,
    required: true
  },
  volume24h: {
    type: Number,
    required: true
  },
  changePercentage24h: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Compound index to ensure unique dates
stepCoinStatsSchema.index({ date: 1 }, { unique: true });

const StepCoinStats = mongoose.model('StepCoinStats', stepCoinStatsSchema);
module.exports = StepCoinStats;
