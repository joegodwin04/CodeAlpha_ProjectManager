const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getComments,
  createComment,
  deleteComment,
} = require('../controllers/commentController');

// All comment routes require authentication
router.use(protect);

// GET  /api/comments/task/:taskId  — list comments for a task
router.get('/task/:taskId', getComments);

// POST /api/comments/task/:taskId  — post a comment on a task
router.post('/task/:taskId', createComment);

// DELETE /api/comments/:id         — delete own comment
router.delete('/:id', deleteComment);

module.exports = router;
