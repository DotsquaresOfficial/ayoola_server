
const express = require('express');
const Conversion = require('../models/Conversion');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all conversion requests (admin only)
router.get('/', [authMiddleware, adminMiddleware], async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status && ['pending', 'approved', 'suspected', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    const conversions = await Conversion.find(query).populate('user', 'name email wallet ipAddress location');
    
    res.status(200).json({
      success: true,
      count: conversions.length,
      data: conversions
    });
  } catch (error) {
    next(error);
  }
});

// Get user's own conversion requests
router.get('/my-requests', authMiddleware, async (req, res, next) => {
  try {
    const conversions = await Conversion.find({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      count: conversions.length,
      data: conversions
    });
  } catch (error) {
    next(error);
  }
});

// Create new conversion request
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { stepsConverted, walletAddress } = req.body;
    
    if (!stepsConverted || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide steps converted and wallet address'
      });
    }
    
    if (stepsConverted <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Steps converted must be greater than 0'
      });
    }
    
    // Calculate coins earned (simple formula: 1 step = 0.01 coins)
    const coinsEarned = stepsConverted * 0.01;
    
    const newConversion = await Conversion.create({
      user: req.user.id,
      stepsConverted,
      coinsEarned,
      walletAddress,
      ipAddress: req.ip || 'Unknown',
      location: req.body.location || 'Unknown'
    });
    
    res.status(201).json({
      success: true,
      data: newConversion
    });
  } catch (error) {
    next(error);
  }
});

// Update conversion request status (admin only)
router.patch('/:id/status', [authMiddleware, adminMiddleware], async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'approved', 'suspected', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "pending", "approved", "suspected" or "rejected"'
      });
    }
    
    const conversion = await Conversion.findById(req.params.id);
    
    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion request not found'
      });
    }
    
    conversion.status = status;
    conversion.processedDate = Date.now();
    await conversion.save();
    
    res.status(200).json({
      success: true,
      message: `Conversion request marked as ${status}`,
      data: conversion
    });
  } catch (error) {
    next(error);
  }
});

// Update multiple conversion requests status (admin only)
router.patch('/status/bulk', [authMiddleware, adminMiddleware], async (req, res, next) => {
  try {
    const { conversionIds, status } = req.body;
    
    if (!conversionIds || !Array.isArray(conversionIds) || conversionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of conversion IDs'
      });
    }

    if (!status || !['pending', 'approved', 'suspected', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "pending", "approved", "suspected" or "rejected"'
      });
    }

    await Conversion.updateMany(
      { _id: { $in: conversionIds } },
      { 
        $set: { 
          status,
          processedDate: Date.now()
        } 
      }
    );

    res.status(200).json({
      success: true,
      message: `${conversionIds.length} conversion requests updated to ${status} successfully`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
