const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ForwardLook = sequelize.define('ForwardLook', {
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
  period: {
    type: DataTypes.ENUM('NEXT_30_DAYS', 'NEXT_60_DAYS', 'NEXT_90_DAYS'),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('MILESTONE', 'DELIVERABLE', 'INVOICE', 'PROCUREMENT', 'RESOURCE', 'DECISION', 'CONTRACTUAL_DEADLINE', 'RISK', 'OTHER'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expected_date: DataTypes.DATEONLY,
  responsible_person: DataTypes.STRING,
  status: DataTypes.STRING,
  impact: DataTypes.TEXT,
}, {
  tableName: 'forward_looks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ForwardLook;
