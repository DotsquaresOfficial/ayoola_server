// routes/points.js
const express = require("express");
const router = express.Router();
const PointHistory = require("../models/PointHistory");
const User = require("../models/User");
const StepCoinConversion = require("../models/StepCoinConversion");
const { ethers } = require("ethers");

const ERC20_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_DAILY_REWARD",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TOTAL_SUPPLY",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "adminBurn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "lastClaimedDay",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "steps",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rewardAmount",
        "type": "uint256"
      }
    ],
    "name": "rewardSteps",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "stakedAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "stepsToday",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const provider = new ethers.JsonRpcProvider('https://polygon-amoy.infura.io/v3/b94a21d7655b424e88f7700f411afb97');
const stepCoinContractAddress = '0x8639b6D09A669C672d9F6375eD50E45fcC9EF70C';
const stepCoinHolderPrivateKey = '4e87dedb850d2d1eb1f7ab1bb26a5545e1678fcad65894c46ea2f9e3c58678a4'

exports.convertPointsToStepCoins = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { wallet_address, location } = req.body;
    const ip = req.ip;

    // check if user exists
    if (!wallet_address || !userId || !location) {
      return res
        .status(400)
        .json({
          status: 400,
          success: false,
          message: "Wallet address, user ID and location are required.",
        });
    }

    // check if points user exist in databse
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res
        .status(404)
        .json({ status: 400, success: false, message: "User not found." });
    }

    // check if user has enough points
    if (!user.points || user.points < 10000) {
      return res
        .status(400)
        .json({
          status: 400,
          success: false,
          message:
            "Insufficient points. You need at least 10000 points to convert.",
        });
    }

    // deduct points from user
    const points = user.points;
    user.points = 0;
    user.steps = (user.steps || 0) + points / 100;
    user.lastActiveDate = new Date();
    await user.save();
    const newEntry = new PointHistory({
      points,
      user_id: user.id,
      location,
      ip,
      points_direction: "deduct",
    });

    await newEntry.save();
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
    res
      .status(201)
      .json({
        status: 200,
        success: true,
        message: "Points converted to step coins successfully.",
        data: stepCoinConversion.toJSON()
      });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Server error",
    });
  }
};


exports.getWalletBalance = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    // Validate wallet address
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address"
      });
    }
    // Get the balance of step coins for the given wallet address
    const stepCoinContract = new ethers.Contract(stepCoinContractAddress, ERC20_ABI, provider);
    const balance = await stepCoinContract.balanceOf(walletAddress);
    const balanceInEth = ethers.formatEther(balance);

    res.status(200).json({
      success: true,
      message: `Balance fetched successfully for ${walletAddress}`,
      data: {
        walletAddress,
        balance: balanceInEth
      }
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wallet balance",
      error: error.message
    });
  }
};
exports.getStepCoinsConversionHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ status: 400, success: false, message: "user ID are required." });
    }

    // check if points user exist in databse
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res
        .status(404)
        .json({ status: 404, success: false, message: "User not found." });
    }

    const history = await StepCoinConversion.find({ user_id: userId }).sort({
      timestamps: -1,
    });
    if (!history) {
      return res
        .status(404)
        .json({ status: 404, success: false, message: "History not found." });
    }
    // add total points to history
    const historyData = {
      totalPoints: user.points || 0,
      totalSteps: user.steps || 0,
      history: history,
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

exports.getPendingStepCoinRequests = async (req, res, next) => {
  try {
    const requests = await StepCoinConversion.find({ status: "pending" }).sort({
      createdAt: -1,
    });
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
      return res
        .status(404)
        .json({ success: false, message: "Conversion request not found." });
    }

    const senderWallet = new ethers.Wallet(stepCoinHolderPrivateKey, provider);
    const stepCoinContract = new ethers.Contract(stepCoinContractAddress, ERC20_ABI, senderWallet);
    const amountInWei = ethers.parseUnits(request.steps_coins, 18);


    const tx = await stepCoinContract.transfer(request.wallet_address, amountInWei);

    request.status = "approved";
    request.approve_date = new Date();
    request.approved_by = admin._id;
    request.approved_by_name = admin.name || admin.email;
    request.reason = req.body.reason || "Approved by admin";

    await request.save();

    return res.json({
      success: true,
      message: "Request approved.",
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

exports.bulkApproveStepCoinRequests = async (req, res, next) => {
  try {
    const admin = req.user;
    const { requestIds } = req.body;

    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No request IDs provided." });
    }

    const requests = await StepCoinConversion.find({
      _id: { $in: requestIds },
      status: "pending",
    });

    if (requests.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No pending requests found to approve.",
        });
    }
    const senderWallet = new ethers.Wallet(stepCoinHolderPrivateKey, provider);
    const stepCoinContract = new ethers.Contract(stepCoinContractAddress, ERC20_ABI, senderWallet);
    for (const request of requests) {
      try {
        const amountInWei = ethers.parseUnits(request.steps_coins.toString(), 18);
        const tx = await stepCoinContract.transfer(request.wallet_address, amountInWei);
        request.status = "approved";
        request.approve_date = new Date();
        request.approved_by = admin._id;
        request.approved_by_name = admin.name || admin.email;
        request.reason = req.body.reason || "Bulk approved by admin";
        await request.save();
      } catch (error) {
        console.error(`Error processing request ${request._id}:`, error);
        continue; // Skip this request and continue with the next
      }
    }

    return res.json({
      success: true,
      message: `${requests.length} request(s) approved successfully.`,
      approvedRequests: requests.map((r) => r._id),
    });
  } catch (err) {
    next(err);
  }
};

exports.suspectStepCoinRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;

    const request = await StepCoinConversion.findById(requestId);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Conversion request not found." });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: `Cannot mark request with status: ${request.status}`,
        });
    }

    request.status = "suspected";
    request.suspected_date = new Date();
    request.reason = req.body.reason || "Marked as suspected by admin";

    await request.save();

    return res.json({
      success: true,
      message: "Request marked as suspected.",
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

exports.getApprovedStepCoinRequests = async (req, res, next) => {
  try {
    const approved = await StepCoinConversion.find({ status: "approved" }).sort(
      { approve_date: -1 }
    );
    res.json({ success: true, data: approved });
  } catch (err) {
    next(err);
  }
};

exports.getSuspectedStepCoinRequests = async (req, res, next) => {
  try {
    const suspected = await StepCoinConversion.find({
      status: "suspected",
    }).sort({ suspected_date: -1 });
    res.json({ success: true, data: suspected });
  } catch (err) {
    next(err);
  }
};
