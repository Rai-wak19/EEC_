const { Op } = require('sequelize');
const {
  ProjectProgress, FinancialRecord, Risk, Issue, Resource,
  Intervention, RecoveryPlan, ForwardLook, Contract, Milestone, Deliverable, Project, User, Insurance,
  Sla, SlaDeliverable, SlaMilestone
} = require('../models');
const { calcScheduleMetrics, calcRiskRating, calcFinancialMetrics, calcResourceShortfall } = require('../utils/calculations');

// ─── Helper for Role-Based Project Filtering ────────────────────────────────
const getProjectInclude = (userRole) => {
  const include = { model: Project, attributes: ['id', 'project_code', 'project_name'] };
  if (userRole === 'DESIGN_DIRECTOR') {
    include.where = { project_type: 'DESIGN' };
    include.required = true;
  } else if (userRole === 'CONTRACT_ADMIN_DIRECTOR') {
    include.where = { project_type: 'SUPERVISION' };
    include.required = true;
  }
  return include;
};

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
const progressService = {
  getAll: async (projectId, userRole = null) => {
    return ProjectProgress.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [getProjectInclude(userRole)],
      order: [['reporting_month', 'DESC']],
    });
  },
  getById: async (id) => {
    const r = await ProjectProgress.findByPk(id);
    if (!r) throw { status: 404, message: 'Progress record not found.' };
    return r;
  },
  create: async (data) => {
    const dup = await ProjectProgress.findOne({ where: { project_id: data.project_id, reporting_month: data.reporting_month } });
    if (dup) throw { status: 409, message: 'A progress record for this project and reporting month already exists.' };
    const { schedule_variance, spi } = calcScheduleMetrics(data.planned_progress, data.actual_progress);
    return ProjectProgress.create({ ...data, schedule_variance, spi });
  },
  update: async (id, data) => {
    const r = await ProjectProgress.findByPk(id);
    if (!r) throw { status: 404, message: 'Progress record not found.' };
    if (data.planned_progress !== undefined || data.actual_progress !== undefined) {
      const { schedule_variance, spi } = calcScheduleMetrics(
        data.planned_progress ?? r.planned_progress,
        data.actual_progress  ?? r.actual_progress
      );
      data.schedule_variance = schedule_variance;
      data.spi = spi;
    }
    return r.update(data);
  },
  remove: async (id) => {
    const r = await ProjectProgress.findByPk(id);
    if (!r) throw { status: 404, message: 'Progress record not found.' };
    await r.destroy();
  },
};

// ─── CONTRACTS ────────────────────────────────────────────────────────────────
const contractService = {
  getAll: async (projectId, userRole = null) => {
    return Contract.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [getProjectInclude(userRole)],
      order: [['created_at', 'DESC']],
    });
  },
  getById: async (id) => {
    const r = await Contract.findByPk(id, { include: [{ model: Project, attributes: ['id', 'project_code', 'project_name'] }] });
    if (!r) throw { status: 404, message: 'Contract not found.' };
    return r;
  },
  create: async (data) => {
    const m = calcFinancialMetrics({ original_contract_value: data.original_contract_value, variation_value: data.variation_value || 0 });
    return Contract.create({ ...data, revised_contract_value: m.revised_contract_value });
  },
  update: async (id, data) => {
    const r = await Contract.findByPk(id);
    if (!r) throw { status: 404, message: 'Contract not found.' };
    if (data.original_contract_value !== undefined || data.variation_value !== undefined) {
      const m = calcFinancialMetrics({ original_contract_value: data.original_contract_value ?? r.original_contract_value, variation_value: data.variation_value ?? r.variation_value });
      data.revised_contract_value = m.revised_contract_value;
    }
    return r.update(data);
  },
  remove: async (id) => {
    const r = await Contract.findByPk(id);
    if (!r) throw { status: 404, message: 'Contract not found.' };
    await r.destroy();
  },
};

// ─── MILESTONES ───────────────────────────────────────────────────────────────
const milestoneService = {
  getAll: async (projectId, userRole = null) => {
    return Milestone.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [getProjectInclude(userRole)],
      order: [['planned_date', 'ASC']],
    });
  },
  getById: async (id) => {
    const r = await Milestone.findByPk(id);
    if (!r) throw { status: 404, message: 'Milestone not found.' };
    return r;
  },
  create: async (data) => Milestone.create(data),
  update: async (id, data) => {
    const r = await Milestone.findByPk(id);
    if (!r) throw { status: 404, message: 'Milestone not found.' };
    return r.update(data);
  },
  remove: async (id) => {
    const r = await Milestone.findByPk(id);
    if (!r) throw { status: 404, message: 'Milestone not found.' };
    await r.destroy();
  },
};

// ─── DELIVERABLES ─────────────────────────────────────────────────────────────
const deliverableService = {
  getAll: async (projectId, userRole = null) => {
    return Deliverable.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [getProjectInclude(userRole)],
      order: [['planned_date', 'ASC']],
    });
  },
  getById: async (id) => {
    const r = await Deliverable.findByPk(id);
    if (!r) throw { status: 404, message: 'Deliverable not found.' };
    return r;
  },
  create: async (data) => Deliverable.create(data),
  update: async (id, data) => {
    const r = await Deliverable.findByPk(id);
    if (!r) throw { status: 404, message: 'Deliverable not found.' };
    return r.update(data);
  },
  remove: async (id) => {
    const r = await Deliverable.findByPk(id);
    if (!r) throw { status: 404, message: 'Deliverable not found.' };
    await r.destroy();
  },
};

// ─── FINANCIALS ───────────────────────────────────────────────────────────────
const financialService = {
  getAll: async (projectId, userRole = null) => {
    return FinancialRecord.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [getProjectInclude(userRole)],
      order: [['reporting_month', 'DESC']],
    });
  },
  getById: async (id) => {
    const r = await FinancialRecord.findByPk(id);
    if (!r) throw { status: 404, message: 'Financial record not found.' };
    return r;
  },
  create: async (data) => {
    const dup = await FinancialRecord.findOne({ where: { project_id: data.project_id, reporting_month: data.reporting_month } });
    if (dup) throw { status: 409, message: 'A financial record for this project and reporting month already exists.' };
    const m = calcFinancialMetrics(data);
    return FinancialRecord.create({ ...data, revised_contract_value: m.revised_contract_value, outstanding_payment: m.outstanding_payment });
  },
  update: async (id, data) => {
    const r = await FinancialRecord.findByPk(id);
    if (!r) throw { status: 404, message: 'Financial record not found.' };
    const merged = { ...r.toJSON(), ...data };
    const m = calcFinancialMetrics(merged);
    return r.update({ ...data, revised_contract_value: m.revised_contract_value, outstanding_payment: m.outstanding_payment });
  },
  remove: async (id) => {
    const r = await FinancialRecord.findByPk(id);
    if (!r) throw { status: 404, message: 'Financial record not found.' };
    await r.destroy();
  },
};

// ─── RISKS ────────────────────────────────────────────────────────────────────
const riskService = {
  getAll: async (projectId, userRole = null) => {
    return Risk.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [getProjectInclude(userRole)],
      order: [['rating', 'DESC']],
    });
  },
  getById: async (id) => {
    const r = await Risk.findByPk(id);
    if (!r) throw { status: 404, message: 'Risk not found.' };
    return r;
  },
  create: async (data) => {
    const { score } = calcRiskRating(data.probability, data.impact);
    return Risk.create({ ...data, rating: score });
  },
  update: async (id, data) => {
    const r = await Risk.findByPk(id);
    if (!r) throw { status: 404, message: 'Risk not found.' };
    if (data.probability || data.impact) {
      const { score } = calcRiskRating(data.probability || r.probability, data.impact || r.impact);
      data.rating = score;
    }
    return r.update(data);
  },
  remove: async (id) => {
    const r = await Risk.findByPk(id);
    if (!r) throw { status: 404, message: 'Risk not found.' };
    await r.destroy();
  },
};

// ─── ISSUES ───────────────────────────────────────────────────────────────────
const issueService = {
  getAll: async (projectId, userRole = null) => {
    return Issue.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [getProjectInclude(userRole)],
      order: [['severity', 'DESC']],
    });
  },
  getById: async (id) => {
    const r = await Issue.findByPk(id);
    if (!r) throw { status: 404, message: 'Issue not found.' };
    return r;
  },
  create: async (data) => Issue.create(data),
  update: async (id, data) => {
    const r = await Issue.findByPk(id);
    if (!r) throw { status: 404, message: 'Issue not found.' };
    return r.update(data);
  },
  remove: async (id) => {
    const r = await Issue.findByPk(id);
    if (!r) throw { status: 404, message: 'Issue not found.' };
    await r.destroy();
  },
};

// ─── RESOURCES ────────────────────────────────────────────────────────────────
const resourceService = {
  getAll: async (projectId, userRole = null) => {
    return Resource.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [getProjectInclude(userRole)],
    });
  },
  getById: async (id) => {
    const r = await Resource.findByPk(id);
    if (!r) throw { status: 404, message: 'Resource not found.' };
    return r;
  },
  create: async (data) => {
    const shortfall = calcResourceShortfall(data.required_quantity, data.available_quantity);
    return Resource.create({ ...data, shortfall });
  },
  update: async (id, data) => {
    const r = await Resource.findByPk(id);
    if (!r) throw { status: 404, message: 'Resource not found.' };
    const shortfall = calcResourceShortfall(data.required_quantity ?? r.required_quantity, data.available_quantity ?? r.available_quantity);
    return r.update({ ...data, shortfall });
  },
  remove: async (id) => {
    const r = await Resource.findByPk(id);
    if (!r) throw { status: 404, message: 'Resource not found.' };
    await r.destroy();
  },
};

// ─── INTERVENTIONS ────────────────────────────────────────────────────────────
const interventionService = {
  getAll: async (projectId, userRole = null) => {
    const projectInclude = getProjectInclude(userRole);
    return Intervention.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [
        projectInclude,
        { model: Risk,    attributes: ['id', 'risk_code'], required: false },
        { model: Issue,   attributes: ['id', 'issue_code'], required: false },
      ],
      order: [['deadline', 'ASC']],
    });
  },
  getById: async (id) => {
    const r = await Intervention.findByPk(id);
    if (!r) throw { status: 404, message: 'Intervention not found.' };
    return r;
  },
  create: async (data) => Intervention.create(data),
  update: async (id, data) => {
    const r = await Intervention.findByPk(id);
    if (!r) throw { status: 404, message: 'Intervention not found.' };
    return r.update(data);
  },
  remove: async (id) => {
    const r = await Intervention.findByPk(id);
    if (!r) throw { status: 404, message: 'Intervention not found.' };
    await r.destroy();
  },
};

// ─── RECOVERY PLANS ───────────────────────────────────────────────────────────
const recoveryService = {
  getAll: async (projectId, userRole = null) => {
    return RecoveryPlan.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [getProjectInclude(userRole)],
    });
  },
  getById: async (id) => {
    const r = await RecoveryPlan.findByPk(id);
    if (!r) throw { status: 404, message: 'Recovery plan not found.' };
    return r;
  },
  create: async (data) => RecoveryPlan.create(data),
  update: async (id, data) => {
    const r = await RecoveryPlan.findByPk(id);
    if (!r) throw { status: 404, message: 'Recovery plan not found.' };
    return r.update(data);
  },
  remove: async (id) => {
    const r = await RecoveryPlan.findByPk(id);
    if (!r) throw { status: 404, message: 'Recovery plan not found.' };
    await r.destroy();
  },
};

// ─── FORWARD LOOK ─────────────────────────────────────────────────────────────
const forwardLookService = {
  getAll: async (projectId, userRole = null) => {
    return ForwardLook.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [getProjectInclude(userRole)],
      order: [['expected_date', 'ASC']],
    });
  },
  getById: async (id) => {
    const r = await ForwardLook.findByPk(id);
    if (!r) throw { status: 404, message: 'Forward look item not found.' };
    return r;
  },
  create: async (data) => ForwardLook.create(data),
  update: async (id, data) => {
    const r = await ForwardLook.findByPk(id);
    if (!r) throw { status: 404, message: 'Forward look item not found.' };
    return r.update(data);
  },
  remove: async (id) => {
    const r = await ForwardLook.findByPk(id);
    if (!r) throw { status: 404, message: 'Forward look item not found.' };
    await r.destroy();
  },
};

// ─── INSURANCE ────────────────────────────────────────────────────────────────
const insuranceService = {
  getAll: async (projectId, userRole = null) => {
    return Insurance.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [getProjectInclude(userRole)],
      order: [['expiry_date', 'ASC']],
    });
  },
  getById: async (id) => {
    const r = await Insurance.findByPk(id);
    if (!r) throw { status: 404, message: 'Insurance not found.' };
    return r;
  },
  create: async (data) => Insurance.create(data),
  update: async (id, data) => {
    const r = await Insurance.findByPk(id);
    if (!r) throw { status: 404, message: 'Insurance not found.' };
    return r.update(data);
  },
  remove: async (id) => {
    const r = await Insurance.findByPk(id);
    if (!r) throw { status: 404, message: 'Insurance not found.' };
    await r.destroy();
  },
};

// ─── SLA ──────────────────────────────────────────────────────────────────────
const slaService = {
  getAll: async (projectId, userRole = null) => {
    return Sla.findAll({
      where: projectId ? { project_id: projectId } : {},
      include: [
        getProjectInclude(userRole),
        { model: SlaDeliverable, as: 'deliverables', attributes: ['id', 'status'] },
        { model: SlaMilestone, as: 'milestones', attributes: ['id', 'status'] },
      ],
      order: [['agreement_date', 'DESC']],
    });
  },
  getById: async (id) => {
    const r = await Sla.findByPk(id, {
      include: [
        { model: Project, attributes: ['id', 'project_code', 'project_name', 'client'] },
        { model: SlaDeliverable, as: 'deliverables' },
        { model: SlaMilestone, as: 'milestones' },
      ],
    });
    if (!r) throw { status: 404, message: 'SLA not found.' };
    return r;
  },
  create: async (data) => {
    const dup = await Sla.findOne({ where: { sla_number: data.sla_number } });
    if (dup) throw { status: 409, message: 'An SLA with this number already exists.' };
    return Sla.create(data);
  },
  update: async (id, data) => {
    const r = await Sla.findByPk(id);
    if (!r) throw { status: 404, message: 'SLA not found.' };
    return r.update(data);
  },
  remove: async (id) => {
    const r = await Sla.findByPk(id);
    if (!r) throw { status: 404, message: 'SLA not found.' };
    await r.destroy();
  },
};

// ─── SLA DELIVERABLES ─────────────────────────────────────────────────────────
const slaDeliverableService = {
  getAll: async (slaId) => {
    return SlaDeliverable.findAll({
      where: slaId ? { sla_id: slaId } : {},
      order: [['due_date', 'ASC']],
    });
  },
  getById: async (id) => {
    const r = await SlaDeliverable.findByPk(id);
    if (!r) throw { status: 404, message: 'SLA Deliverable not found.' };
    return r;
  },
  create: async (data) => SlaDeliverable.create(data),
  update: async (id, data) => {
    const r = await SlaDeliverable.findByPk(id);
    if (!r) throw { status: 404, message: 'SLA Deliverable not found.' };
    return r.update(data);
  },
  remove: async (id) => {
    const r = await SlaDeliverable.findByPk(id);
    if (!r) throw { status: 404, message: 'SLA Deliverable not found.' };
    await r.destroy();
  },
};

// ─── SLA MILESTONES ───────────────────────────────────────────────────────────
const slaMilestoneService = {
  getAll: async (slaId) => {
    return SlaMilestone.findAll({
      where: slaId ? { sla_id: slaId } : {},
      order: [['due_date', 'ASC']],
    });
  },
  getById: async (id) => {
    const r = await SlaMilestone.findByPk(id);
    if (!r) throw { status: 404, message: 'SLA Milestone not found.' };
    return r;
  },
  create: async (data) => SlaMilestone.create(data),
  update: async (id, data) => {
    const r = await SlaMilestone.findByPk(id);
    if (!r) throw { status: 404, message: 'SLA Milestone not found.' };
    return r.update(data);
  },
  remove: async (id) => {
    const r = await SlaMilestone.findByPk(id);
    if (!r) throw { status: 404, message: 'SLA Milestone not found.' };
    await r.destroy();
  },
};

// ─── USERS ────────────────────────────────────────────────────────────────────
const userService = {
  getAll: async () => User.findAll({ attributes: { exclude: ['password_hash'] } }),
  getById: async (id) => {
    const r = await User.findByPk(id, { attributes: { exclude: ['password_hash'] } });
    if (!r) throw { status: 404, message: 'User not found.' };
    return r;
  },
  update: async (id, data) => {
    const r = await User.findByPk(id);
    if (!r) throw { status: 404, message: 'User not found.' };
    const { password_hash, ...safe } = data;
    return r.update(safe);
  },
  remove: async (id) => {
    const r = await User.findByPk(id);
    if (!r) throw { status: 404, message: 'User not found.' };
    await r.destroy();
  },
};

module.exports = {
  progressService, contractService, milestoneService, deliverableService,
  financialService, riskService, issueService, resourceService,
  interventionService, recoveryService, forwardLookService, userService, insuranceService,
  slaService, slaDeliverableService, slaMilestoneService,
};
