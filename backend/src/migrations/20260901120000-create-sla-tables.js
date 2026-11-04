'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = (await queryInterface.showAllTables()).map(t => t.toLowerCase ? t.toLowerCase() : t);

    if (!tables.includes('slas')) {
      await queryInterface.createTable('slas', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER },
        sla_number: { allowNull: false, unique: true, type: Sequelize.STRING },
        project_id: {
          allowNull: false, type: Sequelize.INTEGER,
          references: { model: 'projects', key: 'id' },
          onDelete: 'CASCADE', onUpdate: 'CASCADE',
        },
        sector: {
          allowNull: false,
          type: Sequelize.ENUM('Building and Urban', 'Surveying', 'Laboratory', 'Water and Energy', 'Construction', 'Geotechnical'),
        },
        agreement_amount: { allowNull: false, type: Sequelize.DECIMAL(15, 2) },
        agreement_date: { allowNull: false, type: Sequelize.DATEONLY },
        completion_date: { allowNull: false, type: Sequelize.DATEONLY },
        monthly_recognition_amount: { allowNull: false, type: Sequelize.DECIMAL(15, 2) },
        created_at: { allowNull: false, type: Sequelize.DATE },
        updated_at: { allowNull: false, type: Sequelize.DATE },
      });
      console.log('Created slas table.');
    } else {
      console.log('slas table already exists, skipping.');
    }

    if (!tables.includes('sla_deliverables')) {
      await queryInterface.createTable('sla_deliverables', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER },
        sla_id: {
          allowNull: false, type: Sequelize.INTEGER,
          references: { model: 'slas', key: 'id' },
          onDelete: 'CASCADE', onUpdate: 'CASCADE',
        },
        name: { allowNull: false, type: Sequelize.STRING },
        description: { type: Sequelize.TEXT },
        due_date: { type: Sequelize.DATEONLY },
        status: {
          type: Sequelize.ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'),
          defaultValue: 'PLANNED',
        },
        completion_date: { type: Sequelize.DATEONLY },
        notes: { type: Sequelize.TEXT },
        created_at: { allowNull: false, type: Sequelize.DATE },
        updated_at: { allowNull: false, type: Sequelize.DATE },
      });
      console.log('Created sla_deliverables table.');
    } else {
      console.log('sla_deliverables table already exists, skipping.');
    }

    if (!tables.includes('sla_milestones')) {
      await queryInterface.createTable('sla_milestones', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER },
        sla_id: {
          allowNull: false, type: Sequelize.INTEGER,
          references: { model: 'slas', key: 'id' },
          onDelete: 'CASCADE', onUpdate: 'CASCADE',
        },
        name: { allowNull: false, type: Sequelize.STRING },
        description: { type: Sequelize.TEXT },
        due_date: { type: Sequelize.DATEONLY },
        status: {
          type: Sequelize.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'),
          defaultValue: 'NOT_STARTED',
        },
        completion_date: { type: Sequelize.DATEONLY },
        notes: { type: Sequelize.TEXT },
        created_at: { allowNull: false, type: Sequelize.DATE },
        updated_at: { allowNull: false, type: Sequelize.DATE },
      });
      console.log('Created sla_milestones table.');
    } else {
      console.log('sla_milestones table already exists, skipping.');
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('sla_milestones');
    await queryInterface.dropTable('sla_deliverables');
    await queryInterface.dropTable('slas');
  },
};
