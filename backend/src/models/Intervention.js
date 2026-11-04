const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Intervention = sequelize.define('Intervention', {
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
  risk_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'risks',
      key: 'id'
    }
  },
  issue_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'issues',
      key: 'id'
    }
  },
  priority: {
    type: DataTypes.ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
    allowNull: false,
  },
  problem: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  impact: DataTypes.TEXT,
  required_decision: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  responsible_person: DataTypes.STRING,
  deadline: DataTypes.DATEONLY,
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'),
    defaultValue: 'PENDING',
  },
  resolution: DataTypes.TEXT,
}, {
  tableName: 'interventions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Intervention;
