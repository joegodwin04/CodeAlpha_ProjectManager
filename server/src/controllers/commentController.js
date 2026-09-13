const { Comment, Task, Project, User, Notification } = require('../models');
const { getIO } = require('../socket');

/**
 * Helper: verify task exists and belongs to a project owned by the requesting user.
 * Returns { task, projectId } or throws a 404/403 response.
 */
const verifyTaskAccess = async (taskId, userId, res) => {
  const task = await Task.findOne({
    where: { id: taskId },
    include: [{ model: Project, attributes: ['id', 'userId'] }],
  });

  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return null;
  }

  if (task.Project.userId !== userId) {
    res.status(403).json({ message: 'Not authorized to access this task' });
    return null;
  }

  return task;
};

// GET /api/comments/task/:taskId
const getComments = async (req, res) => {
  try {
    const task = await verifyTaskAccess(req.params.taskId, req.user.id, res);
    if (!task) return;

    const comments = await Comment.findAll({
      where: { taskId: req.params.taskId },
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'username'] }],
      order: [['createdAt', 'ASC']],
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/comments/task/:taskId
const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const task = await verifyTaskAccess(req.params.taskId, req.user.id, res);
    if (!task) return;

    const comment = await Comment.create({
      content: content.trim(),
      taskId: req.params.taskId,
      userId: req.user.id,
    });

    // Reload with author info to send back to clients
    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'username'] }],
    });

    const projectId = task.projectId;

    // Emit real-time event to the project room
    try {
      const io = getIO();
      if (io) {
        io.to(`project-${projectId}`).emit('commentAdded', {
          comment: fullComment,
          taskId: req.params.taskId,
          projectId,
        });
      }
    } catch (socketErr) {
      console.error('[Socket.IO] Failed to emit commentAdded:', socketErr.message);
    }

    // Notify all OTHER members of the project that a comment was added
    // (In this project tasks are owned by a single user, so notify the task owner if different)
    try {
      if (task.userId && task.userId !== req.user.id) {
        const notification = await Notification.create({
          type: 'comment_added',
          message: `${req.user.name} commented on task "${task.title}"`,
          userId: task.userId,
          projectId,
          taskId: task.id,
        });

        const io = getIO();
        if (io) {
          io.to(`user-${task.userId}`).emit('notification', notification);
        }
      }
    } catch (notifErr) {
      console.error('[Notification] Failed to create comment notification:', notifErr.message);
    }

    res.status(201).json(fullComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    // Load task to get projectId for socket room
    const task = await Task.findByPk(comment.taskId);
    await comment.destroy();

    // Notify room that a comment was removed
    try {
      const io = getIO();
      if (io && task) {
        io.to(`project-${task.projectId}`).emit('commentDeleted', {
          commentId: req.params.id,
          taskId: comment.taskId,
          projectId: task.projectId,
        });
      }
    } catch (socketErr) {
      console.error('[Socket.IO] Failed to emit commentDeleted:', socketErr.message);
    }

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getComments, createComment, deleteComment };
