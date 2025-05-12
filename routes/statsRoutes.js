
const express = require('express');
const UserStats = require('../models/UserStats');
const PointStats = require('../models/PointStats');
const StepCoinStats = require('../models/StepCoinStats');
const ConversionStats = require('../models/ConversionStats');
const DashboardStats = require('../models/DashboardStats');
const Conversion = require('../models/Conversion');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get user growth data for charts
router.get('/users/growth', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const stats = await UserStats.find({
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    if (!stats.length) {
      return res.status(404).json({
        success: false,
        message: 'No user growth data found'
      });
    }
    
    const formattedData = stats.map(stat => ({
      date: stat.date.toISOString().split('T')[0],
      users: stat.totalUsers,
      activeUsers: stat.activeUsers,
      newUsers: stat.newUsers
    }));
    
    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get points data (earned vs converted)
router.get('/points', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const stats = await PointStats.find({
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    if (!stats.length) {
      return res.status(404).json({
        success: false,
        message: 'No points data found'
      });
    }
    
    const formattedData = stats.map(stat => ({
      month: new Date(stat.date).toLocaleString('default', { month: 'short' }),
      date: stat.date.toISOString().split('T')[0],
      earned: stat.earned,
      converted: stat.converted
    }));
    
    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get STEP coin price history
router.get('/stepcoin/history', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { days = 180 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const stats = await StepCoinStats.find({
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    if (!stats.length) {
      return res.status(404).json({
        success: false,
        message: 'No STEP coin data found'
      });
    }
    
    const formattedData = stats.map(stat => ({
      date: new Date(stat.date).toLocaleString('default', { month: 'short' }),
      price: stat.price
    }));
    
    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get current STEP coin details
router.get('/stepcoin/current', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const latestStats = await StepCoinStats.findOne().sort({ date: -1 });
    
    if (!latestStats) {
      return res.status(404).json({
        success: false,
        message: 'No STEP coin data found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        currentValue: latestStats.price,
        changePercentage: latestStats.changePercentage24h,
        marketCap: latestStats.marketCap,
        circulatingSupply: latestStats.circulatingSupply,
        volume24h: latestStats.volume24h,
        conversionRate: "100 Points = 1 STEP" // This is fixed for now
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get token distribution data
router.get('/stepcoin/distribution', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    // Token distribution is currently a fixed policy
    const distributionData = [
      { category: "User Rewards", percentage: 60 },
      { category: "Team & Development", percentage: 20 },
      { category: "Reserve", percentage: 10 },
      { category: "Marketing", percentage: 5 },
      { category: "Partners", percentage: 5 },
    ];
    
    res.status(200).json({
      success: true,
      data: distributionData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get conversion requests data by day
router.get('/conversions/by-day', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const stats = await ConversionStats.find({
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    if (!stats.length) {
      return res.status(404).json({
        success: false,
        message: 'No conversion data found'
      });
    }
    
    const formattedData = stats.map(stat => {
      const day = new Date(stat.date).toLocaleString('default', { weekday: 'short' });
      return {
        day,
        date: stat.date.toISOString().split('T')[0],
        requests: stat.totalRequests,
        points: stat.totalSteps
      };
    });
    
    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get conversion size distribution
router.get('/conversions/size-distribution', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    // Calculate the sum of each size category
    const latestStat = await ConversionStats.findOne().sort({ date: -1 });
    
    if (!latestStat) {
      return res.status(404).json({
        success: false,
        message: 'No conversion data found'
      });
    }
    
    const sizeDistribution = [
      { size: "Small (<1000)", value: latestStat.smallConversions },
      { size: "Medium (1000-3000)", value: latestStat.mediumConversions },
      { size: "Large (>3000)", value: latestStat.largeConversions }
    ];
    
    res.status(200).json({
      success: true,
      data: sizeDistribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get conversion status distribution
router.get('/conversions/status-distribution', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const latestStat = await ConversionStats.findOne().sort({ date: -1 });
    
    if (!latestStat) {
      return res.status(404).json({
        success: false,
        message: 'No conversion data found'
      });
    }
    
    const statusDistribution = [
      { status: "Approved", value: latestStat.approvedConversions },
      { status: "Pending", value: latestStat.pendingConversions },
      { status: "Suspected", value: latestStat.suspectedConversions }
    ];
    
    res.status(200).json({
      success: true,
      data: statusDistribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get approver distribution (system vs admin)
router.get('/conversions/approver-distribution', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const latestStat = await ConversionStats.findOne().sort({ date: -1 });
    
    if (!latestStat) {
      return res.status(404).json({
        success: false,
        message: 'No conversion data found'
      });
    }
    
    const approverDistribution = [
      { processor: "System Auto-Approval", value: latestStat.systemApprovals },
      { processor: "Admin Approval", value: latestStat.adminApprovals }
    ];
    
    res.status(200).json({
      success: true,
      data: approverDistribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get top users by conversions
router.get('/users/top-conversions', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Aggregate to get top users by conversion count
    const topUsers = await Conversion.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$user',
          conversions: { $sum: 1 },
          stepCoins: { $sum: '$coinsEarned' }
        }
      },
      { $sort: { conversions: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    // Get user details
    const userDetails = await Promise.all(
      topUsers.map(async (item) => {
        const user = await User.findById(item._id);
        return {
          name: user ? user.name : 'Unknown User',
          conversions: item.conversions,
          stepCoins: item.stepCoins
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: userDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get daily activity for suspected requests
router.get('/suspected/by-day', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    // Build daily activity data for suspected conversions over the last week
    const days = 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const suspectedByDay = await Conversion.aggregate([
      {
        $match: {
          status: 'suspected',
          requestDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$requestDate" } },
          requests: { $sum: 1 },
          points: { $sum: "$stepsConverted" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format the data
    const formattedData = suspectedByDay.map(item => {
      const date = new Date(item._id);
      return {
        day: date.toLocaleString('default', { weekday: 'short' }),
        requests: item.requests,
        points: item.points
      };
    });
    
    // Fill in missing days with zeros
    const allDays = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleString('default', { weekday: 'short' });
    }).reverse();
    
    const result = allDays.map(day => {
      const existingDay = formattedData.find(d => d.day === day);
      return existingDay || { day, requests: 0, points: 0 };
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get reasons for suspicion distribution
router.get('/suspected/reasons', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    // This would be based on real data from the suspected conversions
    // For now, we'll provide mock data until the actual reason field is tracked
    const suspicionReasons = [
      { reason: "Unusual activity", value: 35 },
      { reason: "Multiple rapid requests", value: 25 },
      { reason: "Suspicious spike", value: 20 },
      { reason: "Inconsistent data", value: 15 },
      { reason: "Multiple accounts", value: 5 },
    ];
    
    res.status(200).json({
      success: true,
      data: suspicionReasons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
