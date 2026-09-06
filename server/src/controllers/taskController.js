const { Task, Project } = require('../models');

// Get all tasks for user
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.id },
      include: [{ model: Project, attributes: ['id', 'title'] }],
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
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Project, attributes: ['id', 'title'] }]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId } = req.body;

    // Verify project belongs to user
    const project = await Project.findOne({ where: { id: projectId, userId: req.user.id } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      userId: req.user.id
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, status, priority, dueDate, projectId } = req.body;

    // Optional: If projectId is changing, verify the new project belongs to user
    if (projectId && projectId !== task.projectId) {
      const project = await Project.findOne({ where: { id: projectId, userId: req.user.id } });
      if (!project) {
        return res.status(404).json({ message: 'Project not found or unauthorized' });
      }
    }

    const updatedTask = await task.update({
      title,
      description,
      status,
      priority,
      dueDate,
      projectId: projectId || task.projectId
    });

    // Recalculate and persist project progress based on task completion
    try {
      const affectedProjectId = projectId || task.projectId;
      const allProjectTasks = await Task.findAll({ where: { projectId: affectedProjectId } });
      const totalCount = allProjectTasks.length;
      const doneCount = allProjectTasks.filter(t => t.status === 'Done').length;
      const newProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
      await Project.update({ progress: newProgress }, { where: { id: affectedProjectId, userId: req.user.id } });
    } catch (progressErr) {
      // Non-fatal: log but don't fail the task update response
      console.error('Failed to recalculate project progress:', progressErr.message);
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const projectId = task.projectId;
    await task.destroy();

    // Recalculate project progress after deletion
    try {
      const remainingTasks = await Task.findAll({ where: { projectId } });
      const totalCount = remainingTasks.length;
      const doneCount = remainingTasks.filter(t => t.status === 'Done').length;
      const newProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
      await Project.update({ progress: newProgress }, { where: { id: projectId, userId: req.user.id } });
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
