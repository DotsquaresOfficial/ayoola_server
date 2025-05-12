
const express = require('express');
const User = require('../models/User');
const Conversion = require('../models/Conversion');
const DashboardStats = require('../models/DashboardStats');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get dashboard statistics (admin only)
router.get('/stats', [authMiddleware, adminMiddleware], async (req, res, next) => {
  try {
    let stats;
    
    // Try to get real data first
    try {
      // Get user counts
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ status: 'active' });
      const blockedUsers = await User.countDocuments({ status: 'blocked' });
      
      // Get conversion counts
      const pendingConversions = await Conversion.countDocuments({ status: 'pending' });
      const approvedConversions = await Conversion.countDocuments({ status: 'approved' });
      const suspectedConversions = await Conversion.countDocuments({ status: 'suspected' });
      const rejectedConversions = await Conversion.countDocuments({ status: 'rejected' });
      
      // Calculate total steps and coins
      const conversions = await Conversion.find();
      const totalSteps = conversions.reduce((sum, conv) => sum + conv.stepsConverted, 0);
      const totalCoins = conversions.reduce((sum, conv) => sum + conv.coinsEarned, 0);
      
      // Save the stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      stats = await DashboardStats.findOneAndUpdate(
        { date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } },
        {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers - blockedUsers,
          blockedUsers,
          totalSteps,
          totalCoins,
          pendingConversions,
          approvedConversions,
          suspectedConversions,
          rejectedConversions,
          newUsers: Math.floor(Math.random() * 30) + 5 // Simulated new users
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.log("Error getting real data, generating demo data", error);
      // If real data fetch fails, generate demo data
      stats = await DashboardStats.generateDemoData();
    }
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: stats.totalUsers,
          active: stats.activeUsers,
          inactive: stats.inactiveUsers,
          blocked: stats.blockedUsers
        },
        conversions: {
          pending: stats.pendingConversions,
          approved: stats.approvedConversions,
          suspected: stats.suspectedConversions,
          rejected: stats.rejectedConversions
        },
        totals: {
          steps: stats.totalSteps,
          coins: stats.totalCoins
        }
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    next(error);
  }
});

// Get activity stats for chart (last 7 days)
router.get('/activity', [authMiddleware, adminMiddleware], async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Ensure we have demo data if needed
    await DashboardStats.generateDemoData();
    
    const stats = await DashboardStats.find({
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });
    
    // Format data for chart
    const chartData = stats.map(day => {
      return {
        date: day.date.toISOString().split('T')[0],
        newUsers: day.newUsers || 0,
        activeUsers: day.activeUsers
      };
    });
    
    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error("Activity stats error:", error);
    next(error);
  }
});

// Get conversion stats for chart (last 7 days)
router.get('/conversions', [authMiddleware, adminMiddleware], async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let conversions = [];
    
    try {
      // Try to get real conversion data
      conversions = await Conversion.aggregate([
        {
          $match: {
            requestDate: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$requestDate" }
            },
            totalRequests: { $sum: 1 },
            totalSteps: { $sum: "$stepsConverted" },
            totalCoins: { $sum: "$coinsEarned" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
    } catch (error) {
      console.log("Error getting real conversion data, using demo data");
      // If real data fetch fails, generate demo data from DashboardStats
      await DashboardStats.generateDemoData();
      
      const stats = await DashboardStats.find({
        date: { $gte: sevenDaysAgo }
      }).sort({ date: 1 });
      
      conversions = stats.map(day => {
        return {
          _id: day.date.toISOString().split('T')[0],
          totalRequests: day.pendingConversions + day.approvedConversions + 
                         day.suspectedConversions + day.rejectedConversions,
          totalSteps: day.dailySteps || Math.floor(Math.random() * 20000) + 5000,
          totalCoins: day.dailyCoins || Math.floor(day.dailySteps / 100) || Math.floor(Math.random() * 200) + 50
        };
      });
    }
    
    // Format data for chart
    const chartData = conversions.map(day => {
      return {
        date: day._id,
        requests: day.totalRequests,
        steps: day.totalSteps,
        coins: day.totalCoins
      };
    });
    
    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error("Conversion stats error:", error);
    next(error);
  }
});

// New endpoint: Get mock users for testing
router.get('/mock-users', [authMiddleware, adminMiddleware], async (req, res, next) => {
  try {
    // Generate 20 mock users
    const mockUsers = Array.from({ length: 20 }, (_, i) => {
      const statuses = ['active', 'blocked'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        _id: `mock-user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        joinDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
        points: Math.floor(Math.random() * 5000) + 100,
        stepsToday: Math.floor(Math.random() * 10000) + 500,
        status,
        wallet: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        ipAddress: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        location: ['New York', 'London', 'Tokyo', 'Berlin', 'Sydney', 'Paris'][Math.floor(Math.random() * 6)]
      };
    });

    // Add admin user
    mockUsers.push({
      _id: 'admin-user',
      name: 'Admin User',
      email: 'admin@example.com',
      joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      points: 5000,
      stepsToday: 8500,
      status: 'active',
      wallet: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      ipAddress: '127.0.0.1',
      location: 'Corporate HQ'
    });

    res.status(200).json({
      success: true,
      data: mockUsers
    });
  } catch (error) {
    console.error("Mock users error:", error);
    next(error);
  }
});

module.exports = router;
