const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Milestone = sequelize.define('Milestone', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  planned_date: DataTypes.DATEONLY,
  actual_date: DataTypes.DATEONLY,
  status: {
    type: DataTypes.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'AT_RISK', 'CANCELLED'),
    defaultValue: 'NOT_STARTED',
  },
  responsible_person: DataTypes.STRING,
  is_critical: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  notes: DataTypes.TEXT,
}, {
  tableName: 'milestones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Milestone;
