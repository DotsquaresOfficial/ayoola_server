
const mongoose = require('mongoose');

const conversionStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  totalRequests: {
    type: Number,
    default: 0
  },
  totalSteps: {
    type: Number,
    default: 0
  },
  totalCoins: {
    type: Number,
    default: 0
  },
  // Add distribution by size
  smallConversions: {
    type: Number,
    default: 0  // <1000
  },
  mediumConversions: {
    type: Number,
    default: 0  // 1000-3000
  },
  largeConversions: {
    type: Number,
    default: 0  // >3000
  },
  // Add distribution by status
  approvedConversions: {
    type: Number,
    default: 0
  },
  pendingConversions: {
    type: Number,
    default: 0
  },
  suspectedConversions: {
    type: Number,
    default: 0
  },
  rejectedConversions: {
    type: Number,
    default: 0
  },
  // Track the processor type
  systemApprovals: {
    type: Number,
    default: 0
  },
  adminApprovals: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index to ensure unique dates
conversionStatsSchema.index({ date: 1 }, { unique: true });

const ConversionStats = mongoose.model('ConversionStats', conversionStatsSchema);
module.exports = ConversionStats;
