const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getDashboardStats, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUsers);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
