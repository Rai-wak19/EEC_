'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const expectedTables = [
      'users', 'projects', 'contracts', 'milestones', 'deliverables',
      'financial_records', 'risks', 'issues', 'resources',
      'project_progress', 'interventions', 'recovery_plans', 'forward_looks'
    ];
    
    // PostgreSQL usually returns lowercase, but we lowercase for safety just in case
    const existingTables = (await queryInterface.showAllTables()).map(t => t.toLowerCase ? t.toLowerCase() : t);
    const existingExpectedTables = expectedTables.filter(t => existingTables.includes(t));

    if (existingExpectedTables.length === expectedTables.length) {
      console.log('All expected tables already exist. Skipping initial table creation to preserve existing data (baseline established).');
      return;
    }

    if (existingExpectedTables.length > 0) {
      throw new Error(`Database is partially initialized. Found ${existingExpectedTables.length} out of ${expectedTables.length} expected tables. Manual review required to prevent data loss or corruption.`);
    }

    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.createTable('users', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        name: { allowNull: false, type: Sequelize.STRING, },
        email: { allowNull: false, type: Sequelize.STRING, },
        password_hash: { allowNull: false, type: Sequelize.STRING, },
        role: { allowNull: false, type: Sequelize.ENUM(["ADMIN","TRANSPORT_MANAGER","PLANNING_MANAGER","PROJECT_MANAGER","FINANCE","VIEWER"]), defaultValue: 'VIEWER', },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true, },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('projects', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_code: { allowNull: false, type: Sequelize.STRING, },
        project_name: { allowNull: false, type: Sequelize.STRING, },
        client: { type: Sequelize.STRING, },
        employer: { type: Sequelize.STRING, },
        contract_no: { type: Sequelize.STRING, },
        consultant: { type: Sequelize.STRING, },
        responsible_team: { type: Sequelize.STRING, },
        project_manager_name: { type: Sequelize.STRING, },
        project_manager_id: { allowNull: true, type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        commencement_date: { type: Sequelize.DATEONLY, },
        completion_date: { type: Sequelize.DATEONLY, },
        duration_months: { type: Sequelize.DECIMAL, },
        contract_value: { type: Sequelize.DECIMAL, },
        currency: { type: Sequelize.STRING, },
        project_status: { type: Sequelize.ENUM(["ACTIVE","COMPLETED","SUSPENDED","CANCELLED","ON_HOLD"]), defaultValue: 'ACTIVE', },
        project_type: { allowNull: true, type: Sequelize.ENUM(["DESIGN","SUPERVISION"]), defaultValue: 'SUPERVISION', },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('contracts', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_id: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        contract_no: { type: Sequelize.STRING, },
        contract_title: { type: Sequelize.STRING, },
        client: { type: Sequelize.STRING, },
        contractor_or_consultant: { type: Sequelize.STRING, },
        original_contract_value: { type: Sequelize.DECIMAL, defaultValue: 0, },
        variation_value: { type: Sequelize.DECIMAL, defaultValue: 0, },
        revised_contract_value: { type: Sequelize.DECIMAL, defaultValue: 0, },
        currency: { type: Sequelize.STRING, },
        contract_start_date: { type: Sequelize.DATEONLY, },
        contract_end_date: { type: Sequelize.DATEONLY, },
        contract_status: { type: Sequelize.ENUM(["ACTIVE","COMPLETED","EXPIRED","SUSPENDED","TERMINATED"]), defaultValue: 'ACTIVE', },
        notes: { type: Sequelize.TEXT, },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('milestones', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_id: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        name: { allowNull: false, type: Sequelize.STRING, },
        description: { type: Sequelize.TEXT, },
        planned_date: { type: Sequelize.DATEONLY, },
        actual_date: { type: Sequelize.DATEONLY, },
        status: { type: Sequelize.ENUM(["NOT_STARTED","IN_PROGRESS","COMPLETED","DELAYED","AT_RISK","CANCELLED"]), defaultValue: 'NOT_STARTED', },
        responsible_person: { type: Sequelize.STRING, },
        is_critical: { type: Sequelize.BOOLEAN, defaultValue: false, },
        notes: { type: Sequelize.TEXT, },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('deliverables', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_id: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        name: { allowNull: false, type: Sequelize.STRING, },
        category: { allowNull: false, type: Sequelize.ENUM(["REPORT","SURVEY","DESIGN","TRAINING","SOFTWARE","DOCUMENTATION","OTHER"]), },
        planned_date: { type: Sequelize.DATEONLY, },
        actual_date: { type: Sequelize.DATEONLY, },
        status: { type: Sequelize.ENUM(["PLANNED","IN_PROGRESS","COMPLETED","DELAYED","AT_RISK","CANCELLED"]), defaultValue: 'PLANNED', },
        responsible_person: { type: Sequelize.STRING, },
        is_critical: { type: Sequelize.BOOLEAN, defaultValue: false, },
        description: { type: Sequelize.TEXT, },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('financial_records', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_id: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        reporting_month: { allowNull: false, type: Sequelize.DATEONLY, },
        original_contract_value: { type: Sequelize.DECIMAL, },
        variation_value: { type: Sequelize.DECIMAL, },
        revised_contract_value: { type: Sequelize.DECIMAL, },
        planned_invoicing: { type: Sequelize.DECIMAL, },
        actual_invoicing: { type: Sequelize.DECIMAL, },
        amount_certified: { type: Sequelize.DECIMAL, },
        amount_received: { type: Sequelize.DECIMAL, },
        outstanding_payment: { type: Sequelize.DECIMAL, },
        planned_cost: { type: Sequelize.DECIMAL, },
        actual_cost: { type: Sequelize.DECIMAL, },
        forecast_cost: { type: Sequelize.DECIMAL, },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('risks', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_id: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        risk_code: { allowNull: false, type: Sequelize.STRING, },
        description: { allowNull: false, type: Sequelize.TEXT, },
        category: { type: Sequelize.STRING, },
        probability: { allowNull: false, type: Sequelize.ENUM(["LOW","MEDIUM","HIGH"]), },
        impact: { allowNull: false, type: Sequelize.ENUM(["LOW","MEDIUM","HIGH"]), },
        rating: { type: Sequelize.INTEGER, },
        mitigation_action: { type: Sequelize.TEXT, },
        responsible_person: { type: Sequelize.STRING, },
        target_date: { type: Sequelize.DATEONLY, },
        status: { type: Sequelize.ENUM(["OPEN","MITIGATING","CLOSED","ESCALATED"]), defaultValue: 'OPEN', },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('issues', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_id: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        issue_code: { allowNull: false, type: Sequelize.STRING, },
        description: { allowNull: false, type: Sequelize.TEXT, },
        category: { type: Sequelize.STRING, },
        severity: { allowNull: false, type: Sequelize.ENUM(["LOW","MEDIUM","HIGH","CRITICAL"]), },
        impact: { type: Sequelize.TEXT, },
        action_required: { type: Sequelize.TEXT, },
        responsible_person: { type: Sequelize.STRING, },
        target_date: { type: Sequelize.DATEONLY, },
        status: { type: Sequelize.ENUM(["OPEN","IN_PROGRESS","RESOLVED","CLOSED","ESCALATED"]), defaultValue: 'OPEN', },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('resources', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_id: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        resource_type: { allowNull: false, type: Sequelize.ENUM(["HUMAN_RESOURCE","VEHICLE","EQUIPMENT","SUBCONSULTANT","OTHER"]), },
        resource_name: { allowNull: false, type: Sequelize.STRING, },
        required_quantity: { type: Sequelize.INTEGER, defaultValue: 0, },
        available_quantity: { type: Sequelize.INTEGER, defaultValue: 0, },
        operational_quantity: { type: Sequelize.INTEGER, defaultValue: 0, },
        shortfall: { type: Sequelize.INTEGER, },
        status: { type: Sequelize.STRING, },
        notes: { type: Sequelize.TEXT, },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('project_progress', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_id: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        reporting_month: { allowNull: false, type: Sequelize.DATEONLY, },
        planned_progress: { type: Sequelize.DECIMAL, },
        actual_progress: { type: Sequelize.DECIMAL, },
        schedule_variance: { type: Sequelize.DECIMAL, },
        spi: { type: Sequelize.DECIMAL, },
        time_elapsed_percent: { type: Sequelize.DECIMAL, },
        time_remaining_percent: { type: Sequelize.DECIMAL, },
        notes: { type: Sequelize.TEXT, },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('interventions', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_id: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        risk_id: { allowNull: true, type: Sequelize.INTEGER, references: { model: 'risks', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        issue_id: { allowNull: true, type: Sequelize.INTEGER, references: { model: 'issues', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        priority: { allowNull: false, type: Sequelize.ENUM(["CRITICAL","HIGH","MEDIUM","LOW"]), },
        problem: { allowNull: false, type: Sequelize.TEXT, },
        impact: { type: Sequelize.TEXT, },
        required_decision: { allowNull: false, type: Sequelize.TEXT, },
        responsible_person: { type: Sequelize.STRING, },
        deadline: { type: Sequelize.DATEONLY, },
        status: { type: Sequelize.ENUM(["PENDING","IN_PROGRESS","COMPLETED","OVERDUE","CANCELLED"]), defaultValue: 'PENDING', },
        resolution: { type: Sequelize.TEXT, },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('recovery_plans', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_id: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        original_gap: { type: Sequelize.DECIMAL, },
        recovery_target_gap: { type: Sequelize.DECIMAL, },
        current_gap: { type: Sequelize.DECIMAL, },
        recovery_status: { type: Sequelize.ENUM(["NOT_STARTED","IMPROVING","ON_TRACK","AT_RISK","FAILED","COMPLETED"]), defaultValue: 'NOT_STARTED', },
        recovery_action: { type: Sequelize.TEXT, },
        responsible_person: { type: Sequelize.STRING, },
        target_date: { type: Sequelize.DATEONLY, },
        notes: { type: Sequelize.TEXT, },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await queryInterface.createTable('forward_looks', {
        id: { primaryKey: true, autoIncrement: true, type: Sequelize.INTEGER, },
        project_id: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE', },
        period: { allowNull: false, type: Sequelize.ENUM(["NEXT_30_DAYS","NEXT_60_DAYS","NEXT_90_DAYS"]), },
        category: { allowNull: false, type: Sequelize.ENUM(["MILESTONE","DELIVERABLE","INVOICE","PROCUREMENT","RESOURCE","DECISION","CONTRACTUAL_DEADLINE","RISK","OTHER"]), },
        description: { allowNull: false, type: Sequelize.TEXT, },
        expected_date: { type: Sequelize.DATEONLY, },
        responsible_person: { type: Sequelize.STRING, },
        status: { type: Sequelize.STRING, },
        impact: { type: Sequelize.TEXT, },
        created_at: { allowNull: false, type: Sequelize.DATE, },
        updated_at: { allowNull: false, type: Sequelize.DATE, },
      }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

  },
  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('forward_looks', { transaction });
      await queryInterface.dropTable('recovery_plans', { transaction });
      await queryInterface.dropTable('interventions', { transaction });
      await queryInterface.dropTable('project_progress', { transaction });
      await queryInterface.dropTable('resources', { transaction });
      await queryInterface.dropTable('issues', { transaction });
      await queryInterface.dropTable('risks', { transaction });
      await queryInterface.dropTable('financial_records', { transaction });
      await queryInterface.dropTable('deliverables', { transaction });
      await queryInterface.dropTable('milestones', { transaction });
      await queryInterface.dropTable('contracts', { transaction });
      await queryInterface.dropTable('projects', { transaction });
      await queryInterface.dropTable('users', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
