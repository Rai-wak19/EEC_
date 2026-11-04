const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecoveryPlan = sequelize.define('RecoveryPlan', {
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
  original_gap: {
    type: DataTypes.DECIMAL(5, 2),
  },
  recovery_target_gap: {
    type: DataTypes.DECIMAL(5, 2),
  },
  current_gap: {
    type: DataTypes.DECIMAL(5, 2),
  },
  recovery_status: {
    type: DataTypes.ENUM('NOT_STARTED', 'IMPROVING', 'ON_TRACK', 'AT_RISK', 'FAILED', 'COMPLETED'),
    defaultValue: 'NOT_STARTED',
  },
  recovery_action: DataTypes.TEXT,
  responsible_person: DataTypes.STRING,
  target_date: DataTypes.DATEONLY,
  notes: DataTypes.TEXT,
}, {
  tableName: 'recovery_plans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = RecoveryPlan;
