const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    // e.g. 'comment_added', 'task_updated', 'task_assigned'
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Recipient of the notification
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // Optional link payload (e.g. projectId to navigate to)
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});

module.exports = Notification;
