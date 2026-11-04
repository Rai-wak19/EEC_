const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resource = sequelize.define('Resource', {
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
  resource_type: {
    type: DataTypes.ENUM('HUMAN_RESOURCE', 'VEHICLE', 'EQUIPMENT', 'SUBCONSULTANT', 'OTHER'),
    allowNull: false,
  },
  resource_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  required_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  available_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  operational_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  shortfall: {
    type: DataTypes.INTEGER,
  },
  status: DataTypes.STRING,
  notes: DataTypes.TEXT,
}, {
  tableName: 'resources',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Resource;
