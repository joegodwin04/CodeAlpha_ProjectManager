const { Project, Task } = require('../models');

// Get all projects for user
const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Task,
          attributes: ['id', 'status'], // Just enough to count tasks later if needed
        }
      ]
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Task }]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    const { title, description, status, priority, startDate, dueDate, progress } = req.body;

    const project = await Project.create({
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      progress: progress || 0,
      userId: req.user.id
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { title, description, status, priority, startDate, dueDate, progress } = req.body;

    const updatedProject = await project.update({
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      progress
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};
