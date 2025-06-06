const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
    try {

        // All-time totals
        const totalUsers = await User.countDocuments();

        res.status(200).json({
            message: "Dashboard stats fetched successfully",
            success: true,
            data: {
                users: {
                    totalUsers,
                    growth: 10
                },
                points: {
                    totalPoints: 0,
                    growth: 0
                },

                pointsConverted: {
                    pointsConverted: 0,
                    growth: 0
                },
                conversions: {
                    totalConversions: 0,
                    growth: 0
                },
            }

        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ message: "Error fetching dashboard stats." });
    }
};