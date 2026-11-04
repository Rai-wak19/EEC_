const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SlaMilestone = sequelize.define('SlaMilestone', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sla_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'slas',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  due_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'),
    defaultValue: 'NOT_STARTED',
  },
  completion_date: {
    type: DataTypes.DATEONLY,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'sla_milestones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = SlaMilestone;
