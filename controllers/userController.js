const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, {
            _id: 0,                    
            id: 1,
            name: 1,
            email: 1,
            createdAt: 1,
            points: 1,
            steps: 1,
            referrals: 1,
            status: 1,
        });

        return res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};