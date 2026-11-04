'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('sla_deliverables');
    if (!tableDesc.percent) {
      await queryInterface.addColumn('sla_deliverables', 'percent', {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: null,
        comment: 'Percentage of SLA agreement amount attributed to this deliverable',
      });
      console.log('Added percent column to sla_deliverables table.');
    } else {
      console.log('percent column already exists on sla_deliverables, skipping.');
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('sla_deliverables', 'percent');
  },
};
