const express = require('express');
const { convertPointsToStepCoins, getStepCoinsConversionHistory, getPendingStepCoinRequests, approveStepCoinRequest, bulkApproveStepCoinRequests, suspectStepCoinRequest, getApprovedStepCoinRequests, getSuspectedStepCoinRequests } = require('../controllers/stepCoinsController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/convert/:userId', convertPointsToStepCoins);
router.get('/convert-history/:userId', getStepCoinsConversionHistory); 
router.get('/requests',protect, getPendingStepCoinRequests); 
router.post('/approve/:id',protect, approveStepCoinRequest); 
router.post('/bulk-approve',protect, bulkApproveStepCoinRequests); 
router.post('/suspect/:id',protect, suspectStepCoinRequest); 
router.get('/approved',protect, getApprovedStepCoinRequests); 
router.get('/suspected',protect, getSuspectedStepCoinRequests); 

module.exports = router;
