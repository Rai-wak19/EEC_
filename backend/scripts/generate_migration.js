const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/models/index');

const migrationDir = path.join(__dirname, '../src/migrations');
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

// Generate timestamp prefix
const date = new Date();
const prefix = date.toISOString().replace(/\D/g, '').slice(0, 14);
const filename = `${prefix}-initial-migration.js`;
const filepath = path.join(migrationDir, filename);

// We'll use a hack to get the create table queries and write them to a migration file
const queries = [];

sequelize.addHook('beforeQuery', (query, options) => {
  if (query.startsWith('CREATE TABLE')) {
    // Format the query as a string literal for the migration
    queries.push(query);
  }
});

(async () => {
  try {
    // This will just trigger the queries (but we mock the execution if we could, 
    // actually sync({force: false}) on SQLite might execute it if it doesn't exist).
    // Let's use a temporary sqlite in memory to capture all the create statements.
    
    const TempSequelize = require('sequelize');
    const tempSeq = new TempSequelize('sqlite::memory:', { logging: (msg) => {
        if (msg.includes('CREATE TABLE')) {
            queries.push(msg.replace('Executing (default): ', ''));
        }
    } });
    
    // re-init models on tempSeq
    const models = {
      User: require('../src/models/User')(tempSeq, TempSequelize.DataTypes),
      Project: require('../src/models/Project')(tempSeq, TempSequelize.DataTypes),
      Contract: require('../src/models/Contract')(tempSeq, TempSequelize.DataTypes),
      ProjectProgress: require('../src/models/ProjectProgress')(tempSeq, TempSequelize.DataTypes),
      Milestone: require('../src/models/Milestone')(tempSeq, TempSequelize.DataTypes),
      Deliverable: require('../src/models/Deliverable')(tempSeq, TempSequelize.DataTypes),
      FinancialRecord: require('../src/models/FinancialRecord')(tempSeq, TempSequelize.DataTypes),
      Risk: require('../src/models/Risk')(tempSeq, TempSequelize.DataTypes),
      Issue: require('../src/models/Issue')(tempSeq, TempSequelize.DataTypes),
      Resource: require('../src/models/Resource')(tempSeq, TempSequelize.DataTypes),
      Intervention: require('../src/models/Intervention')(tempSeq, TempSequelize.DataTypes),
      RecoveryPlan: require('../src/models/RecoveryPlan')(tempSeq, TempSequelize.DataTypes),
      ForwardLook: require('../src/models/ForwardLook')(tempSeq, TempSequelize.DataTypes),
    };
    
    // Associations
    models.User.hasMany(models.Project, { foreignKey: 'project_manager_id', as: 'managed_projects' });
    models.Project.belongsTo(models.User, { foreignKey: 'project_manager_id', as: 'project_manager' });

    models.Project.hasMany(models.Contract, { foreignKey: 'project_id', as: 'contracts', onDelete: 'CASCADE' });
    models.Project.hasMany(models.ProjectProgress, { foreignKey: 'project_id', as: 'progress', onDelete: 'CASCADE' });
    models.Project.hasMany(models.Milestone, { foreignKey: 'project_id', as: 'milestones', onDelete: 'CASCADE' });
    models.Project.hasMany(models.Deliverable, { foreignKey: 'project_id', as: 'deliverables', onDelete: 'CASCADE' });
    models.Project.hasMany(models.FinancialRecord, { foreignKey: 'project_id', as: 'financial_records', onDelete: 'CASCADE' });
    models.Project.hasMany(models.Risk, { foreignKey: 'project_id', as: 'risks', onDelete: 'CASCADE' });
    models.Project.hasMany(models.Issue, { foreignKey: 'project_id', as: 'issues', onDelete: 'CASCADE' });
    models.Project.hasMany(models.Resource, { foreignKey: 'project_id', as: 'resources', onDelete: 'CASCADE' });
    models.Project.hasMany(models.Intervention, { foreignKey: 'project_id', as: 'interventions', onDelete: 'CASCADE' });
    models.Project.hasMany(models.RecoveryPlan, { foreignKey: 'project_id', as: 'recovery_plans', onDelete: 'CASCADE' });
    models.Project.hasMany(models.ForwardLook, { foreignKey: 'project_id', as: 'forward_looks', onDelete: 'CASCADE' });

    models.Contract.belongsTo(models.Project, { foreignKey: 'project_id' });
    models.ProjectProgress.belongsTo(models.Project, { foreignKey: 'project_id' });
    models.Milestone.belongsTo(models.Project, { foreignKey: 'project_id' });
    models.Deliverable.belongsTo(models.Project, { foreignKey: 'project_id' });
    models.FinancialRecord.belongsTo(models.Project, { foreignKey: 'project_id' });
    models.Risk.belongsTo(models.Project, { foreignKey: 'project_id' });
    models.Issue.belongsTo(models.Project, { foreignKey: 'project_id' });
    models.Resource.belongsTo(models.Project, { foreignKey: 'project_id' });
    models.Intervention.belongsTo(models.Project, { foreignKey: 'project_id' });
    models.RecoveryPlan.belongsTo(models.Project, { foreignKey: 'project_id' });
    models.ForwardLook.belongsTo(models.Project, { foreignKey: 'project_id' });

    models.Risk.hasMany(models.Intervention, { foreignKey: 'risk_id', as: 'interventions' });
    models.Issue.hasMany(models.Intervention, { foreignKey: 'issue_id', as: 'interventions' });
    models.Intervention.belongsTo(models.Risk, { foreignKey: 'risk_id' });
    models.Intervention.belongsTo(models.Issue, { foreignKey: 'issue_id' });

    await tempSeq.sync({ force: true });
    
    // But since the queries are SQLite syntax, we want Postgres syntax or standard Sequelize migrations.
    // Actually, writing standard queryInterface.createTable is much better. Let's do it right.
  } catch(e) {
    console.error(e);
  }
})();
