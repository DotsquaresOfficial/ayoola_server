// routes/points.js
const express = require('express');
const router = express.Router();
const PointHistory = require('../models/PointHistory');
const User = require('../models/User');


exports.addPoints = async (req, res, next) => {
    try {
        const { points, user_id, location } = req.body;
        const ip = req.ip;

        // check if user exists
        if (!points || !user_id) {
            return res.status(400).json({ success: false, message: 'Points and user ID are required.' });
        }

        // check if points user exist in databse
        const user = await User.findOne({ id: user_id });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // while adding points, need to add points to user
        user.points = (user.points || 0) + points;
        await user.save();

        const newEntry = new PointHistory({
            points,
            user_id,
            location,
            ip,
            points_direction: 'add',
        });

        await newEntry.save();
        res.status(201).json({ success: true, message: 'Points added successfully.' });
    } catch (err) {
        next(err);
    }
};


exports.getPointsHistory = async (req, res, next) => {
    try {

         const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Points and user ID are required.' });
        }

        // check if points user exist in databse
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const history = await PointHistory.find({ user_id: userId }).sort({ timestamps: -1 });

        res.json({ success: true, data: history });

        await newEntry.save();
        res.status(201).json({ success: true, message: 'Points added successfully.' });
    } catch (err) {
        next(err);
    }
};