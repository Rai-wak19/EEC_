const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SlaDeliverable = sequelize.define('SlaDeliverable', {
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
    type: DataTypes.ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'),
    defaultValue: 'PLANNED',
  },
  completion_date: {
    type: DataTypes.DATEONLY,
  },
  percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Percentage of SLA agreement amount attributed to this deliverable',
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'sla_deliverables',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = SlaDeliverable;
