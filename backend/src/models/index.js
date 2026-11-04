const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Contract = require('./Contract');
const ProjectProgress = require('./ProjectProgress');
const Milestone = require('./Milestone');
const Deliverable = require('./Deliverable');
const FinancialRecord = require('./FinancialRecord');
const Risk = require('./Risk');
const Issue = require('./Issue');
const Resource = require('./Resource');
const Intervention = require('./Intervention');
const RecoveryPlan = require('./RecoveryPlan');
const ForwardLook = require('./ForwardLook');
const Insurance = require('./Insurance');
const Sla = require('./Sla');
const SlaDeliverable = require('./SlaDeliverable');
const SlaMilestone = require('./SlaMilestone');

// ─── Associations ─────────────────────────────────────────────────────────────

// User <-> Project (Project Manager)
User.hasMany(Project, { foreignKey: 'project_manager_id', as: 'managed_projects' });
Project.belongsTo(User, { foreignKey: 'project_manager_id', as: 'project_manager' });

// Project -> All child entities
Project.hasMany(Contract,        { foreignKey: 'project_id', as: 'contracts',       onDelete: 'CASCADE' });
Project.hasMany(ProjectProgress, { foreignKey: 'project_id', as: 'progress',         onDelete: 'CASCADE' });
Project.hasMany(Milestone,       { foreignKey: 'project_id', as: 'milestones',       onDelete: 'CASCADE' });
Project.hasMany(Deliverable,     { foreignKey: 'project_id', as: 'deliverables',     onDelete: 'CASCADE' });
Project.hasMany(FinancialRecord, { foreignKey: 'project_id', as: 'financial_records',onDelete: 'CASCADE' });
Project.hasMany(Risk,            { foreignKey: 'project_id', as: 'risks',            onDelete: 'CASCADE' });
Project.hasMany(Issue,           { foreignKey: 'project_id', as: 'issues',           onDelete: 'CASCADE' });
Project.hasMany(Resource,        { foreignKey: 'project_id', as: 'resources',        onDelete: 'CASCADE' });
Project.hasMany(Intervention,    { foreignKey: 'project_id', as: 'interventions',    onDelete: 'CASCADE' });
Project.hasMany(RecoveryPlan,    { foreignKey: 'project_id', as: 'recovery_plans',   onDelete: 'CASCADE' });
Project.hasMany(ForwardLook,     { foreignKey: 'project_id', as: 'forward_looks',    onDelete: 'CASCADE' });
Project.hasMany(Insurance,       { foreignKey: 'project_id', as: 'insurances',       onDelete: 'CASCADE' });
Project.hasMany(Sla,             { foreignKey: 'project_id', as: 'slas',             onDelete: 'CASCADE' });

Contract.belongsTo(Project,        { foreignKey: 'project_id' });
ProjectProgress.belongsTo(Project, { foreignKey: 'project_id' });
Milestone.belongsTo(Project,       { foreignKey: 'project_id' });
Deliverable.belongsTo(Project,     { foreignKey: 'project_id' });
FinancialRecord.belongsTo(Project, { foreignKey: 'project_id' });
Risk.belongsTo(Project,            { foreignKey: 'project_id' });
Issue.belongsTo(Project,           { foreignKey: 'project_id' });
Resource.belongsTo(Project,        { foreignKey: 'project_id' });
Intervention.belongsTo(Project,    { foreignKey: 'project_id' });
RecoveryPlan.belongsTo(Project,    { foreignKey: 'project_id' });
ForwardLook.belongsTo(Project,     { foreignKey: 'project_id' });
Insurance.belongsTo(Project,       { foreignKey: 'project_id' });
Sla.belongsTo(Project,             { foreignKey: 'project_id' });

// SLA -> Deliverables / Milestones
Sla.hasMany(SlaDeliverable, { foreignKey: 'sla_id', as: 'deliverables', onDelete: 'CASCADE' });
SlaDeliverable.belongsTo(Sla, { foreignKey: 'sla_id' });

Sla.hasMany(SlaMilestone, { foreignKey: 'sla_id', as: 'milestones', onDelete: 'CASCADE' });
SlaMilestone.belongsTo(Sla, { foreignKey: 'sla_id' });

// Risk / Issue -> Intervention
Risk.hasMany(Intervention,  { foreignKey: 'risk_id',  as: 'interventions' });
Issue.hasMany(Intervention, { foreignKey: 'issue_id', as: 'interventions' });
Intervention.belongsTo(Risk,  { foreignKey: 'risk_id' });
Intervention.belongsTo(Issue, { foreignKey: 'issue_id' });

module.exports = {
  sequelize,
  User,
  Project,
  Contract,
  ProjectProgress,
  Milestone,
  Deliverable,
  FinancialRecord,
  Risk,
  Issue,
  Resource,
  Intervention,
  RecoveryPlan,
  ForwardLook,
  Insurance,
  Sla,
  SlaDeliverable,
  SlaMilestone,
};
