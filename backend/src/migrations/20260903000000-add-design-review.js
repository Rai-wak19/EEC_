'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'postgres') {
      try {
        await queryInterface.sequelize.query("ALTER TYPE enum_projects_project_type ADD VALUE 'DESIGN_REVIEW';");
      } catch(e) {}
      try {
        await queryInterface.sequelize.query("ALTER TYPE enum_projects_project_type ADD VALUE 'DESIGN_REVIEW_SUPERVISION';");
      } catch(e) {}
    } else {
      await queryInterface.changeColumn('projects', 'project_type', {
        type: Sequelize.ENUM('DESIGN', 'SUPERVISION', 'DESIGN_REVIEW', 'DESIGN_REVIEW_SUPERVISION'),
        allowNull: true,
        defaultValue: 'SUPERVISION',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      await queryInterface.changeColumn('projects', 'project_type', {
        type: Sequelize.ENUM('DESIGN', 'SUPERVISION'),
        allowNull: true,
        defaultValue: 'SUPERVISION',
      });
    }
  }
};
