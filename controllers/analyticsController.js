const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
    try {

        // All-time totals
        const totalUsers = await User.countDocuments();

        // add points from all users
        const users = await User.find({}, { points: 1 });
        let totalPoints = 0;
        users.forEach(user => {
            totalPoints += user.points;
        });

        // add steps from all users
        let totalSteps = 0; 
        users.forEach(user => {
            totalSteps += user.steps;
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
                    totalPoints: totalPoints,
                    growth: 43
                },

                pointsConverted: {
                    pointsConverted: totalSteps*10,
                    growth: 65
                },
                conversions: {
                    totalConversions: (totalSteps*10*100)/(totalSteps*10 + totalPoints),
                    growth: 45
                },
            }

        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ message: "Error fetching dashboard stats." });
    }
};