const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  project_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  project_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  client: DataTypes.STRING,
  employer: DataTypes.STRING,
  contract_no: DataTypes.STRING,
  consultant: DataTypes.STRING,
  responsible_team: DataTypes.STRING,
  project_manager_name: DataTypes.STRING,
  project_manager_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  commencement_date: DataTypes.DATEONLY,
  completion_date: DataTypes.DATEONLY,
  contract_signed_date: DataTypes.DATEONLY,
  duration_months: DataTypes.DECIMAL(10, 2),
  contract_value: DataTypes.DECIMAL(15, 2),
  currency: DataTypes.STRING,
  project_status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'SUSPENDED', 'CANCELLED', 'ON_HOLD'),
    defaultValue: 'ACTIVE',
  },
  project_type: {
    type: DataTypes.ENUM('DESIGN', 'SUPERVISION', 'DESIGN_REVIEW', 'DESIGN_REVIEW_SUPERVISION'),
    allowNull: true,
    defaultValue: 'SUPERVISION',
  },
}, {
  tableName: 'projects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Project;
