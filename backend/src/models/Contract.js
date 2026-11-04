const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contract = sequelize.define('Contract', {
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
  contract_no: DataTypes.STRING,
  contract_title: DataTypes.STRING,
  client: DataTypes.STRING,
  contractor_or_consultant: DataTypes.STRING,
  original_contract_value: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: { min: 0 }
  },
  variation_value: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  revised_contract_value: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: { min: 0 }
  },
  currency: DataTypes.STRING,
  contract_start_date: DataTypes.DATEONLY,
  contract_end_date: DataTypes.DATEONLY,
  contract_status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'EXPIRED', 'SUSPENDED', 'TERMINATED'),
    defaultValue: 'ACTIVE',
  },
  notes: DataTypes.TEXT,
}, {
  tableName: 'contracts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Contract;
