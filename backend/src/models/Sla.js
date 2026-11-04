const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sla = sequelize.define('Sla', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sla_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  sector: {
    type: DataTypes.ENUM('Building and Urban', 'Surveying', 'Laboratory', 'Water and Energy', 'Construction', 'Geotechnical'),
    allowNull: false,
  },
  agreement_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  agreement_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  completion_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  monthly_recognition_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.VIRTUAL,
    get() {
      const completionDate = this.getDataValue('completion_date');
      if (!completionDate) return 'Active';
      const comp = new Date(completionDate);
      const now = new Date();
      if (comp < now) return 'Overdue';
      const monthsDiff = (comp.getFullYear() - now.getFullYear()) * 12 + (comp.getMonth() - now.getMonth());
      if (monthsDiff <= 3 && monthsDiff >= 0) return 'Expiring Soon';
      return 'Active';
      // Note: 'Completed' could be a manual toggle, or determined if all deliverables/milestones are done. 
      // For now, based on dates, we return Active/Expiring/Overdue. We can add a manual status column if requested later.
    }
  },
}, {
  tableName: 'slas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Sla;
