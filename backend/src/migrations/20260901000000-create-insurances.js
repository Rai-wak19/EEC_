'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = (await queryInterface.showAllTables()).map(t => t.toLowerCase ? t.toLowerCase() : t);
    if (tables.includes('insurances')) {
      console.log('insurances table already exists, skipping.');
      return;
    }

    await queryInterface.createTable('insurances', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      project_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'projects', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      insurance_type: {
        allowNull: false,
        type: Sequelize.ENUM('ADVANCE_GUARANTEE', 'PROFESSIONAL_INDEMNITY', 'PERFORMANCE_BOND', 'OTHER'),
      },
      insurer: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      start_date: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      expiry_date: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      notes: {
        type: Sequelize.TEXT,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('insurances');
  },
};
