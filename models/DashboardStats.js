
const mongoose = require('mongoose');

const dashboardStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    unique: true
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  inactiveUsers: {
    type: Number,
    default: 0
  },
  blockedUsers: {
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
  pendingConversions: {
    type: Number,
    default: 0
  },
  approvedConversions: {
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
  // Added daily tracking fields
  newUsers: {
    type: Number,
    default: 0
  },
  dailySteps: {
    type: Number,
    default: 0
  },
  dailyCoins: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Helper method to generate demo data
dashboardStatsSchema.statics.generateDemoData = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if we already have data for today
  const existingStats = await this.findOne({
    date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
  });
  
  if (existingStats) {
    return existingStats;
  }
  
  // Generate demo data for the past 30 days if none exists
  const demoData = [];
  let baseUsers = 1000;
  let totalSteps = 2000000;
  let totalCoins = 20000;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const newUsers = Math.floor(Math.random() * 50) + 10;
    baseUsers += newUsers;
    const activeUsers = Math.floor(baseUsers * 0.8);
    const blockedUsers = Math.floor(baseUsers * 0.05);
    const inactiveUsers = baseUsers - activeUsers - blockedUsers;
    
    const dailySteps = Math.floor(Math.random() * 50000) + 10000;
    totalSteps += dailySteps;
    
    const dailyCoins = Math.floor(dailySteps / 100);
    totalCoins += dailyCoins;
    
    const pendingConversions = Math.floor(Math.random() * 10) + 1;
    const approvedConversions = Math.floor(Math.random() * 30) + 5;
    const suspectedConversions = Math.floor(Math.random() * 5);
    const rejectedConversions = Math.floor(Math.random() * 3);
    
    demoData.push({
      date,
      totalUsers: baseUsers,
      activeUsers,
      inactiveUsers,
      blockedUsers,
      totalSteps,
      totalCoins,
      pendingConversions,
      approvedConversions,
      suspectedConversions,
      rejectedConversions,
      newUsers,
      dailySteps,
      dailyCoins
    });
  }
  
  // Insert the demo data
  await this.insertMany(demoData);
  
  // Return today's stats
  return demoData[demoData.length - 1];
};

const DashboardStats = mongoose.model('DashboardStats', dashboardStatsSchema);
module.exports = DashboardStats;
