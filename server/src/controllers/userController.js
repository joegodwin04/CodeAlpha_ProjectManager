const { User, Project, Task } = require('../models');
const bcrypt = require('bcryptjs');

// Get user profile stats
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'securityAnswerHash'] }
    });

    const projectCount = await Project.count({ where: { userId: req.user.id } });
    const completedTasksCount = await Task.count({ 
      where: { 
        userId: req.user.id,
        status: 'Done'
      } 
    });

    res.json({
      user,
      stats: {
        projects: projectCount,
        completedTasks: completedTasksCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name) {
      user.name = req.body.name.trim();
    }
    if (req.body.email) {
      user.email = req.body.email.trim().toLowerCase();
    }

    // Password update for authenticated user with security question verification
    const newPassword = req.body.newPassword || req.body.password;
    if (newPassword || req.body.securityAnswer) {
      if (!req.body.securityAnswer || !req.body.securityAnswer.trim()) {
        return res.status(400).json({ message: 'Security answer is required' });
      }

      if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
      }

      if (!user.securityQuestion || !user.securityAnswerHash) {
        return res.status(400).json({ message: 'No security question is configured for this account' });
      }

      const normalizedAnswer = req.body.securityAnswer.trim().toLowerCase();
      const isMatch = await bcrypt.compare(normalizedAnswer, user.securityAnswerHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Security answer is incorrect' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }

      user.password = newPassword;
    }

    // Allow configuring or updating security question and answer (preserved for recovery compatibility)
    if (req.body.securityQuestion && req.body.securityAnswer && req.body.securityAnswer.trim()) {
      user.securityQuestion = req.body.securityQuestion.trim();
      const salt = await bcrypt.genSalt(10);
      const normalizedAnswer = req.body.securityAnswer.trim().toLowerCase();
      user.securityAnswerHash = await bcrypt.hash(normalizedAnswer, salt);
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      securityQuestion: updatedUser.securityQuestion || null,
      message: newPassword ? 'Password updated successfully' : 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dashboard Stats Endpoint
const getDashboardStats = async (req, res) => {
  try {
    const totalProjects = await Project.count({ where: { userId: req.user.id } });
    const activeProjects = await Project.count({ where: { userId: req.user.id, status: 'Active' } });
    const completedProjects = await Project.count({ where: { userId: req.user.id, status: 'Completed' } });
    
    const totalTasks = await Task.count({ where: { userId: req.user.id } });
    const pendingTasks = await Task.count({ where: { userId: req.user.id, status: 'Todo' } });
    const inProgressTasks = await Task.count({ where: { userId: req.user.id, status: 'In Progress' } });
    const completedTasks = await Task.count({ where: { userId: req.user.id, status: 'Done' } });
    
    // Overdue tasks
    const { Op } = require('sequelize');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = await Task.count({
      where: {
        userId: req.user.id,
        status: { [Op.ne]: 'Done' },
        dueDate: { [Op.lt]: today }
      }
    });

    res.json({
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users for task assignment (public profile info only)
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'username', 'email'],
      order: [['name', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getDashboardStats,
  getUsers
};

