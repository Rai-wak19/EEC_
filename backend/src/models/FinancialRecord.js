const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinancialRecord = sequelize.define('FinancialRecord', {
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
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  original_contract_value: {
    type: DataTypes.DECIMAL(15, 2),
    validate: { min: 0 }
  },
  variation_value: {
    type: DataTypes.DECIMAL(15, 2),
  },
  revised_contract_value: {
    type: DataTypes.DECIMAL(15, 2),
    validate: { min: 0 }
  },
  planned_invoicing: {
    type: DataTypes.DECIMAL(15, 2),
    validate: { min: 0 }
  },
  actual_invoicing: {
    type: DataTypes.DECIMAL(15, 2),
    validate: { min: 0 }
  },
  amount_certified: {
    type: DataTypes.DECIMAL(15, 2),
    validate: { min: 0 }
  },
  amount_received: {
    type: DataTypes.DECIMAL(15, 2),
    validate: { min: 0 }
  },
  outstanding_payment: {
    type: DataTypes.DECIMAL(15, 2),
    validate: { min: 0 }
  },
  planned_cost: {
    type: DataTypes.DECIMAL(15, 2),
    validate: { min: 0 }
  },
  actual_cost: {
    type: DataTypes.DECIMAL(15, 2),
    validate: { min: 0 }
  },
  forecast_cost: {
    type: DataTypes.DECIMAL(15, 2),
    validate: { min: 0 }
  },
}, {
  tableName: 'financial_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = FinancialRecord;
