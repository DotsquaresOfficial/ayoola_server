const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
    try {

        // All-time totals
        const totalUsers = await User.countDocuments();

        // add points from all users
        const users = await User.find({}, { points: 1 });
        let totalPoints = 0;
        users.forEach(user => {
        totalPoints += user.points || 0;
        });

        // add steps from all users
        let totalSteps = 0; 
        users.forEach(user => {
            totalSteps += user.steps || 0;
        });

       

        res.status(200).json({
            message: "Dashboard stats fetched successfully",
            success: true,
            data: {
                users: {
                    totalUsers,
                    growth: 32
                },
                points: {
                    totalPoints: totalPoints || 0,
                    growth: 43
                },

                pointsConverted: {
                    pointsConverted: totalSteps*10 || 0, // Assuming each step converts to 10 points
                    growth: 65
                },
                conversions: {
                    totalConversions: (totalSteps*10*100)/(totalSteps*10 + totalPoints) || 0, // Assuming conversion rate is based on total points and steps
                    growth: 45
                },
            }

        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ message: "Error fetching dashboard stats." });
    }
};