const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Risk = sequelize.define('Risk', {
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
  risk_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: DataTypes.STRING,
  probability: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    allowNull: false,
  },
  impact: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER, // e.g. 1-9
  },
  mitigation_action: DataTypes.TEXT,
  responsible_person: DataTypes.STRING,
  target_date: DataTypes.DATEONLY,
  status: {
    type: DataTypes.ENUM('OPEN', 'MITIGATING', 'CLOSED', 'ESCALATED'),
    defaultValue: 'OPEN',
  },
}, {
  tableName: 'risks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Risk;
