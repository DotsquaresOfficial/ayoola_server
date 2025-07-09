// routes/points.js
const express = require("express");
const router = express.Router();
const PointHistory = require("../models/PointHistory");
const User = require("../models/User");
const { date } = require("joi");

exports.addPoints = async (req, res, next) => {
  try {
    const { points, user_id, location, from } = req.body;
    const ip = req.ip;

    // check if user exists
    if (!points || !user_id || !from) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Points, from and user ID are required.",
      });
    }

    // check if points user exist in databse
    const user = await User.findOne({ id: user_id });
    if (!user) {
      return res
        .status(404)
        .json({ status: 400, success: false, message: "User not found." });
    }

    // while adding points, need to add points to user
    user.points = (user.points || 0) + points;
    await user.save();

    const newEntry = new PointHistory({
      points,
      user_id,
      location,
      ip,
      from,
      points_direction: "add",
    });

    await newEntry.save();
    res.status(201).json({
      success: true,
      status: 200,
      message: "Points added successfully.",
      data: newEntry.toJSON(),
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Server error",
    });
  }
};

exports.getPointsHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Points and user ID are required.",
      });
    }

    const user = await User.findOne({ id: userId });

    if (!user) {
      return res
        .status(404)
        .json({ status: 400, success: false, message: "User not found." });
    }

    const history = await PointHistory.find({ user_id: userId }).sort({
      createdAt: -1,
    });

    if (!history) {
      return res
        .status(404)
        .json({ status: 400, success: false, message: "History not found." });
    }

    const updatedHistory = history.map((item) => {
      if (item.from == null) {
        item.from = "steps";
      }
      return item;
    });

    const historyData = {
      totalPoints: user.points || 0,
      history: updatedHistory,
    };
    return res.json({
      status: 200,
      message: "Points fetched successfully.",
      success: true,
      data: historyData,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Server error",
    });
  }
};
