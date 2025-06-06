const express = require('express');
const router = express.Router();
const { getAllUsers, updateMultipleUserStatuses } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

const { updateUserStatus } = require('../controllers/userController');

router.patch('/:id/update-status',protect, updateUserStatus); 
router.get('/',protect, getAllUsers);
router.patch('/update-multiple-status', updateMultipleUserStatuses); 

module.exports = router;
