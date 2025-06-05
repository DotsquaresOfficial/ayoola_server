const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

const { updateUserStatus } = require('../controllers/userController');

router.patch('/:id/status', updateUserStatus); 
router.get('/',protect, getAllUsers);

module.exports = router;
