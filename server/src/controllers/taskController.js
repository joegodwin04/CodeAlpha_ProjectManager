const { Task, Project, User, Notification } = require('../models');
const { Op } = require('sequelize');
const { getIO } = require('../socket');

// Get all tasks for user (assigned or owned project)
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: Project,
          attributes: ['id', 'title', 'userId'],
          required: false
        },
        {
          model: User,
          attributes: ['id', 'name', 'username', 'email']
        }
      ],
      where: {
        [Op.or]: [
          { userId: req.user.id },
          { '$Project.userId$': req.user.id }
        ]
      },
      order: [['dueDate', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id },
      include: [
        { model: Project, attributes: ['id', 'title', 'userId'] },
        { model: User, attributes: ['id', 'name', 'username', 'email'] }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAssignee = task.userId === req.user.id;
    const isProjectOwner = task.Project && task.Project.userId === req.user.id;
    if (!isAssignee && !isProjectOwner) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId, userId: assignedUserId } = req.body;

    // Verify project belongs to user
    const project = await Project.findOne({ where: { id: projectId, userId: req.user.id } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    const targetUserId = assignedUserId || req.user.id;

    // Validate assignee if specified
    if (assignedUserId) {
      const assignedUser = await User.findByPk(assignedUserId);
      if (!assignedUser) {
        return res.status(400).json({ message: 'Assigned user does not exist' });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      userId: targetUserId
    });

    // Recalculate project progress
    try {
      const allProjectTasks = await Task.findAll({ where: { projectId } });
      const totalCount = allProjectTasks.length;
      const doneCount = allProjectTasks.filter(t => t.status === 'Done').length;
      const newProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
      await Project.update({ progress: newProgress }, { where: { id: projectId } });
    } catch (progressErr) {
      console.error('Failed to recalculate project progress:', progressErr.message);
    }

    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'email'] },
        { model: Project, attributes: ['id', 'title'] }
      ]
    });

    // Notify assignee if not the creator
    if (targetUserId !== req.user.id) {
      try {
        const io = getIO();
        const notification = await Notification.create({
          type: 'task_assigned',
          message: `${req.user.name} assigned you to task "${task.title}"`,
          userId: targetUserId,
          projectId: project.id,
          taskId: task.id,
        });
        if (io) {
          io.to(`user-${targetUserId}`).emit('notification', notification);
        }
      } catch (notifErr) {
        console.error('Failed to emit task assigned notification:', notifErr.message);
      }
    }

    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id },
      include: [
        { model: Project, attributes: ['id', 'title', 'userId'] },
        { model: User, attributes: ['id', 'name', 'username', 'email'] }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAssignee = task.userId === req.user.id;
    const isProjectOwner = task.Project && task.Project.userId === req.user.id;
    if (!isAssignee && !isProjectOwner) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { title, description, status, priority, dueDate, projectId, userId: assignedUserId } = req.body;

    // Optional: If projectId is changing, verify the new project belongs to user
    if (projectId && projectId !== task.projectId) {
      const project = await Project.findOne({ where: { id: projectId, userId: req.user.id } });
      if (!project) {
        return res.status(404).json({ message: 'Project not found or unauthorized' });
      }
    }

    const oldAssigneeId = task.userId;
    let targetUserId = oldAssigneeId;
    if (assignedUserId !== undefined && assignedUserId !== null && assignedUserId !== '') {
      const assignedUser = await User.findByPk(assignedUserId);
      if (!assignedUser) {
        return res.status(400).json({ message: 'Assigned user does not exist' });
      }
      targetUserId = assignedUserId;
    }

    await task.update({
      title,
      description,
      status,
      priority,
      dueDate,
      projectId: projectId || task.projectId,
      userId: targetUserId
    });

    const targetProjectId = task.projectId || projectId;

    // Recalculate and persist project progress based on task completion
    try {
      const allProjectTasks = await Task.findAll({ where: { projectId: targetProjectId } });
      const totalCount = allProjectTasks.length;
      const doneCount = allProjectTasks.filter(t => t.status === 'Done').length;
      const newProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
      await Project.update({ progress: newProgress }, { where: { id: targetProjectId } });
    } catch (progressErr) {
      // Non-fatal: log but don't fail the task update response
      console.error('Failed to recalculate project progress:', progressErr.message);
    }

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'email'] },
        { model: Project, attributes: ['id', 'title'] }
      ]
    });

    // Emit real-time Socket.IO event to project room
    try {
      const io = getIO();
      if (io) {
        const roomName = `project-${targetProjectId}`;
        io.to(roomName).emit('taskUpdated', updatedTask);
      }
    } catch (socketErr) {
      console.error('Failed to emit taskUpdated event:', socketErr.message);
    }

    // Emit notification
    try {
      const io = getIO();
      if (io) {
        if (targetUserId !== oldAssigneeId && targetUserId !== req.user.id) {
          // New assignment notification
          const notification = await Notification.create({
            type: 'task_assigned',
            message: `${req.user.name} assigned you to task "${updatedTask.title}"`,
            userId: targetUserId,
            projectId: targetProjectId,
            taskId: updatedTask.id,
          });
          io.to(`user-${targetUserId}`).emit('notification', notification);
        } else if (targetUserId !== req.user.id) {
          // Task updated notification
          const notification = await Notification.create({
            type: 'task_updated',
            message: `${req.user.name} updated task "${updatedTask.title}"`,
            userId: targetUserId,
            projectId: targetProjectId,
            taskId: updatedTask.id,
          });
          io.to(`user-${targetUserId}`).emit('notification', notification);
        }
      }
    } catch (notifErr) {
      console.error('Failed to emit task notification:', notifErr.message);
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id },
      include: [{ model: Project, attributes: ['id', 'userId'] }]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAssignee = task.userId === req.user.id;
    const isProjectOwner = task.Project && task.Project.userId === req.user.id;
    if (!isAssignee && !isProjectOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    const projectId = task.projectId;
    await task.destroy();

    // Recalculate project progress after deletion
    try {
      const remainingTasks = await Task.findAll({ where: { projectId } });
      const totalCount = remainingTasks.length;
      const doneCount = remainingTasks.filter(t => t.status === 'Done').length;
      const newProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
      await Project.update({ progress: newProgress }, { where: { id: projectId } });
    } catch (progressErr) {
      console.error('Failed to recalculate project progress after deletion:', progressErr.message);
    }

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
