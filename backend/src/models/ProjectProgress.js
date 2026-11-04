const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProjectProgress = sequelize.define('ProjectProgress', {
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
  reporting_month: {
    type: DataTypes.DATEONLY, // Representing e.g. '2026-05-01' for May 2026
    allowNull: false,
  },
  planned_progress: {
    type: DataTypes.DECIMAL(5, 2),
    validate: { min: 0, max: 100 }
  },
  actual_progress: {
    type: DataTypes.DECIMAL(5, 2),
    validate: { min: 0, max: 100 }
  },
  schedule_variance: {
    type: DataTypes.DECIMAL(5, 2),
  },
  spi: {
    type: DataTypes.DECIMAL(5, 2),
  },
  time_elapsed_percent: {
    type: DataTypes.DECIMAL(5, 2),
    validate: { min: 0, max: 100 }
  },
  time_remaining_percent: {
    type: DataTypes.DECIMAL(5, 2),
    validate: { min: 0, max: 100 }
  },
  notes: DataTypes.TEXT,
}, {
  tableName: 'project_progress',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ProjectProgress;
