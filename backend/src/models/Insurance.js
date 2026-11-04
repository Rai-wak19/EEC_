const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Insurance = sequelize.define('Insurance', {
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
  insurance_type: {
    type: DataTypes.ENUM('ADVANCE_GUARANTEE', 'PROFESSIONAL_INDEMNITY', 'PERFORMANCE_BOND', 'OTHER'),
    allowNull: false,
  },
  insurer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  remaining_months: {
    type: DataTypes.VIRTUAL,
    get() {
      const expiry = this.getDataValue('expiry_date');
      if (!expiry) return 0;
      const now = new Date();
      const exp = new Date(expiry);
      const months = (exp.getFullYear() - now.getFullYear()) * 12 + (exp.getMonth() - now.getMonth());
      return months > 0 ? months : 0;
    }
  },
  notes: DataTypes.TEXT,
}, {
  tableName: 'insurances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Insurance;
