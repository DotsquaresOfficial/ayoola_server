// routes/points.js
const express = require('express');
const router = express.Router();
const PointHistory = require('../models/PointHistory');
const User = require('../models/User');
const StepCoinConversion = require('../models/StepCoinConversion');


exports.convertPointsToStepCoins = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { wallet_address, location } = req.body;
        const ip = req.ip;

        // check if user exists
        if (!wallet_address || !userId || !location) {
            return res.status(400).json({ success: false, message: 'Wallet address, user ID and location are required.' });
        }

        // check if points user exist in databse
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // check if user has enough points
        if (!user.points || user.points < 10000) {
            return res.status(400).json({ success: false, message: 'Insufficient points. You need at least 10000 points to convert.' });
        }

        // deduct points from user
        const points = user.points; n
        user.points = 0;
        user.steps = (user.steps || 0) + (points / 100);
        user.lastActiveDate = new Date();
        await user.save();
        // create a new step coin conversion entry
        const newEntry = new PointHistory({
            points,
            user_id: user.id,
            location,
            ip,
            points_direction: 'deduct',
        });

        await newEntry.save();
        // create a new step coin conversion entry
        const stepCoinConversion = new StepCoinConversion({
            user_name: user.name,
            user_id: user.id,
            steps_coins: points / 100, 
            points,
            wallet_address,
            location,
            ip,
        });

        await stepCoinConversion.save();
        res.status(201).json({ success: true, message: 'Points converted to step coins successfully.' });

    } catch (err) {
        next(err);
    }
};


exports.getStepCoinsConversionHistory = async (req, res, next) => {
    try {

        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'user ID are required.' });
        }

        // check if points user exist in databse
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const history = await StepCoinConversion.find({ user_id: userId }).sort({ timestamps: -1 });
        if (!history) {
            return res.status(404).json({ success: false, message: 'History not found.' });
        }
        // add total points to history
        const historyData = {
            totalPoints: user.points || 0,
            totalSteps: user.steps || 0,
            history: history
        }
        return res.json({ message: 'Points fetched successfully.', success: true, data: historyData });

    } catch (err) {
        next(err);
    }
};

exports.getPendingStepCoinRequests = async (req, res, next) => {
  try {
    const requests = await StepCoinConversion.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};


exports.approveStepCoinRequest = async (req, res, next) => {
  try {
    const admin = req.user;

    const requestId = req.params.id;
    const request = await StepCoinConversion.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Conversion request not found.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot approve request with status: ${request.status}` });
    }

    request.status = 'approved';
    request.approve_date = new Date();
    request.approved_by = admin._id;
    request.approved_by_name = admin.name || admin.email;
    request.reason = req.body.reason || 'Approved by admin';

    await request.save();

    return res.json({ success: true, message: 'Request approved.', data: request });
  } catch (err) {
    next(err);
  }
};


exports.suspectStepCoinRequest = async (req, res, next) => {
  try {
    
    const requestId = req.params.id;

    const request = await StepCoinConversion.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Conversion request not found.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot mark request with status: ${request.status}` });
    }

    request.status = 'suspected';
    request.suspected_date = new Date();
    request.reason = req.body.reason || 'Marked as suspected by admin';

    await request.save();

    return res.json({ success: true, message: 'Request marked as suspected.', data: request });
  } catch (err) {
    next(err);
  }
};


exports.getApprovedStepCoinRequests = async (req, res, next) => {
  try {
    const approved = await StepCoinConversion.find({ status: 'approved' }).sort({ approve_date: -1 });
    res.json({ success: true, data: approved });
  } catch (err) {
    next(err);
  }
};


exports.getSuspectedStepCoinRequests = async (req, res, next) => {
  try {
    const suspected = await StepCoinConversion.find({ status: 'suspected' }).sort({ suspected_date: -1 });
    res.json({ success: true, data: suspected });
  } catch (err) {
    next(err);
  }
};