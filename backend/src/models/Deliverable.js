const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Deliverable = sequelize.define('Deliverable', {
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
  category: {
    type: DataTypes.ENUM('REPORT', 'SURVEY', 'DESIGN', 'TRAINING', 'SOFTWARE', 'DOCUMENTATION', 'OTHER'),
    allowNull: false,
  },
  planned_date: DataTypes.DATEONLY,
  actual_date: DataTypes.DATEONLY,
  status: {
    type: DataTypes.ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'AT_RISK', 'CANCELLED'),
    defaultValue: 'PLANNED',
  },
  responsible_person: DataTypes.STRING,
  is_critical: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  description: DataTypes.TEXT,
}, {
  tableName: 'deliverables',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Deliverable;
