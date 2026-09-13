const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

// All notification routes require authentication
router.use(protect);

// GET    /api/notifications               — fetch latest 50 notifications
router.get('/', getNotifications);

// PATCH  /api/notifications/mark-all-read — mark all as read
router.patch('/mark-all-read', markAllAsRead);

// PATCH  /api/notifications/:id/read      — mark one as read
router.patch('/:id/read', markAsRead);

// DELETE /api/notifications/:id           — delete one notification
router.delete('/:id', deleteNotification);

module.exports = router;
