const { Op, fn, col, literal } = require('sequelize');
const {
  Project, ProjectProgress, FinancialRecord, Risk, Issue,
  Intervention, Milestone, Deliverable, Resource, RecoveryPlan, ForwardLook, User
} = require('../models');
const { calcScheduleMetrics, deriveStatusFromSPI, isOverdue } = require('../utils/calculations');

// ─── Helper for Role-Based Project Filtering ────────────────────────────────
const getProjectTypeFilter = (userRole) => {
  if (userRole === 'DESIGN_DIRECTOR') return 'DESIGN';
  if (userRole === 'CONTRACT_ADMIN_DIRECTOR') return 'SUPERVISION';
  return null;
};

const getProjectInclude = (userRole, extraProps = {}) => {
  const include = { model: Project, attributes: ['id', 'project_code', 'project_name'], ...extraProps };
  const typeFilter = getProjectTypeFilter(userRole);
  if (typeFilter) {
    include.where = { ...include.where, project_type: typeFilter };
    include.required = true;
  }
  return include;
};

// ─── Helper: get the latest progress record for each active project ───────────
const getActiveProjectsWithProgress = async (userRole) => {
  const where = { project_status: 'ACTIVE' };
  const typeFilter = getProjectTypeFilter(userRole);
  if (typeFilter) where.project_type = typeFilter;

  const projects = await Project.findAll({
    where,
    include: [
      { model: User, as: 'project_manager', attributes: ['id', 'name'] }
    ],
  });

  const enriched = await Promise.all(projects.map(async (p) => {
    const prog = await ProjectProgress.findOne({
      where: { project_id: p.id },
      order: [['reporting_month', 'DESC']],
    });
    const fin = await FinancialRecord.findOne({
      where: { project_id: p.id },
      order: [['reporting_month', 'DESC']],
    });
    const metrics = prog
      ? calcScheduleMetrics(prog.planned_progress, prog.actual_progress)
      : { schedule_variance: null, spi: null };
    const health_status = deriveStatusFromSPI(metrics.spi);
    const rcv = fin ? parseFloat(fin.amount_received || 0) : 0;
    const project_contract_val = parseFloat(p.contract_value || 0);
    const rcv_contract = (fin && parseFloat(fin.revised_contract_value || 0) > 0)
      ? parseFloat(fin.revised_contract_value)
      : project_contract_val;
      
    const financial_progress = rcv_contract > 0
      ? parseFloat(((rcv / rcv_contract) * 100).toFixed(2))
      : null;

    // Always recalculate from dates so stale DB values are never shown
    let calc_duration = null;
    if (p.commencement_date && p.completion_date) {
      const start = new Date(p.commencement_date);
      const end = new Date(p.completion_date);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      calc_duration = months > 0 ? months : 0;
    }

    return {
      ...p.toJSON(),
      prog,
      fin,
      duration_months: calc_duration,
      planned_progress: prog ? parseFloat(prog.planned_progress || 0) : null,
      actual_progress:  prog ? parseFloat(prog.actual_progress  || 0) : null,
      schedule_variance: metrics.schedule_variance,
      spi: metrics.spi,
      health_status,
      financial_progress,
      contract_value: parseFloat(p.contract_value || 0),
    };
  }));
  return enriched;
};

// ─── Overview KPI ─────────────────────────────────────────────────────────────
const getOverview = async (userRole = null) => {
  const projects = await getActiveProjectsWithProgress(userRole);
  const total = projects.length;
  const green  = projects.filter(p => p.health_status === 'GREEN').length;
  const yellow = projects.filter(p => p.health_status === 'YELLOW').length;
  const red    = projects.filter(p => p.health_status === 'RED').length;
  const gray   = projects.filter(p => p.health_status === 'GRAY').length;

  // Weighted by contract_value
  const totalContractValue = projects.reduce((s, p) => s + p.contract_value, 0);
  let overall_planned = null, overall_actual = null;
  if (totalContractValue > 0) {
    overall_planned = projects.reduce((s, p) => {
      return s + (p.planned_progress !== null ? p.planned_progress * p.contract_value : 0);
    }, 0) / totalContractValue;
    overall_actual = projects.reduce((s, p) => {
      return s + (p.actual_progress !== null ? p.actual_progress * p.contract_value : 0);
    }, 0) / totalContractValue;
  }

  const validSPIs = projects.filter(p => p.spi !== null).map(p => p.spi);
  const avg_spi = validSPIs.length > 0
    ? parseFloat((validSPIs.reduce((a, b) => a + b, 0) / validSPIs.length).toFixed(4))
    : null;

  const schedule_variance = (overall_planned !== null && overall_actual !== null)
    ? parseFloat((overall_actual - overall_planned).toFixed(2))
    : null;

  // Financial aggregates
  let total_amount_received = 0, total_revised_contract = 0, total_outstanding = 0;
  projects.forEach(p => {
    if (p.fin) {
      total_amount_received  += parseFloat(p.fin.amount_received  || 0);
      total_revised_contract += parseFloat(p.fin.revised_contract_value || 0) > 0 
        ? parseFloat(p.fin.revised_contract_value) 
        : parseFloat(p.contract_value || 0);
      total_outstanding      += parseFloat(p.fin.outstanding_payment   || 0);
    } else {
      total_revised_contract += parseFloat(p.contract_value || 0);
    }
  });
  const overall_financial_progress = total_revised_contract > 0
    ? parseFloat(((total_amount_received / total_revised_contract) * 100).toFixed(2))
    : null;

  // Critical risks
  const critical_risks = await Risk.count({
    where: { status: { [Op.in]: ['OPEN', 'ESCALATED'] }, rating: { [Op.gte]: 6 } },
  });

  // Pending critical/high interventions
  const interventions_required = await Intervention.count({
    where: {
      status:   { [Op.in]: ['PENDING', 'IN_PROGRESS', 'OVERDUE'] },
      priority: { [Op.in]: ['CRITICAL', 'HIGH'] },
    },
  });

  let latest_reporting_month = null;
  projects.forEach(p => {
    if (p.prog && p.prog.reporting_month) {
      if (!latest_reporting_month || new Date(p.prog.reporting_month) > new Date(latest_reporting_month)) {
        latest_reporting_month = p.prog.reporting_month;
      }
    }
  });

  return {
    total_active_projects: total,
    green, yellow, red, gray,
    overall_planned_progress:  overall_planned  !== null ? parseFloat(overall_planned.toFixed(2))  : null,
    overall_actual_progress:   overall_actual   !== null ? parseFloat(overall_actual.toFixed(2))   : null,
    schedule_variance,
    avg_spi,
    overall_financial_progress,
    total_amount_received: parseFloat(total_amount_received.toFixed(2)),
    total_outstanding_receivables: parseFloat(total_outstanding.toFixed(2)),
    critical_risks,
    interventions_required,
    latest_reporting_month,
  };
};

// ─── Project Status Table ─────────────────────────────────────────────────────
const getProjectStatus = async (userRole = null) => {
  const projects = await getActiveProjectsWithProgress(userRole);
  return projects.map(p => {
    const highRisks = 0; // populated in risk dashboard
    return {
      id: p.id,
      project_code: p.project_code,
      project_name: p.project_name,
      client: p.client,
      project_manager_name: p.project_manager_name,
      project_manager: p.project_manager,
      duration_months: p.duration_months,
      contract_signed_date: p.contract_signed_date,
      commencement_date: p.commencement_date,
      completion_date: p.completion_date,
      planned_progress: p.planned_progress,
      actual_progress:  p.actual_progress,
      schedule_variance: p.schedule_variance,
      spi: p.spi,
      financial_progress: p.financial_progress,
      health_status: p.health_status,
      project_status: p.project_status,
      contract_value: p.contract_value,
    };
  });
};

// ─── Schedule Performance ─────────────────────────────────────────────────────
const getScheduleDashboard = async (userRole = null) => {
  const projects = await getActiveProjectsWithProgress(userRole);
  const delayed_milestones = await Milestone.count({
    where: {
      status: { [Op.notIn]: ['COMPLETED', 'CANCELLED'] },
      planned_date: { [Op.lt]: new Date() },
    },
  });
  return {
    projects: projects.map(p => ({
      id: p.id,
      project_code: p.project_code,
      project_name: p.project_name,
      planned_progress: p.planned_progress,
      actual_progress:  p.actual_progress,
      schedule_variance: p.schedule_variance,
      spi: p.spi,
      health_status: p.health_status,
    })),
    delayed_milestones,
  };
};

// ─── Financial Dashboard ──────────────────────────────────────────────────────
const getFinancialDashboard = async (userRole = null) => {
  const projects = await getActiveProjectsWithProgress(userRole);
  return projects.map(p => ({
    id: p.id,
    project_code: p.project_code,
    project_name: p.project_name,
    contract_value: p.contract_value,
    financial_progress: p.financial_progress,
    amount_received:      p.fin ? parseFloat(p.fin.amount_received      || 0) : null,
    amount_certified:     p.fin ? parseFloat(p.fin.amount_certified      || 0) : null,
    outstanding_payment:  p.fin ? parseFloat(p.fin.outstanding_payment   || 0) : null,
    planned_invoicing:    p.fin ? parseFloat(p.fin.planned_invoicing     || 0) : null,
    actual_invoicing:     p.fin ? parseFloat(p.fin.actual_invoicing      || 0) : null,
    revised_contract_value: p.fin ? parseFloat(p.fin.revised_contract_value || 0) : null,
  }));
};

// ─── Deliverables Dashboard ───────────────────────────────────────────────────
const getDeliverablesDashboard = async (userRole = null) => {
  const categories = ['REPORT', 'SURVEY', 'DESIGN', 'TRAINING', 'SOFTWARE', 'DOCUMENTATION', 'OTHER'];
  const result = await Promise.all(categories.map(async (cat) => {
    const total     = await Deliverable.count({ where: { category: cat } });
    const completed = await Deliverable.count({ where: { category: cat, status: 'COMPLETED' } });
    const delayed   = await Deliverable.count({ where: { category: cat, status: 'DELAYED' } });
    const at_risk   = await Deliverable.count({ where: { category: cat, status: 'AT_RISK' } });
    return { category: cat, total, completed, delayed, at_risk };
  }));
  const critical_delayed = await Deliverable.findAll({
    where: { is_critical: true, status: { [Op.in]: ['DELAYED', 'AT_RISK'] } },
    include: [getProjectInclude(userRole, { as: undefined })],
  });
  return { by_category: result, critical_delayed };
};

// ─── Resources Dashboard ─────────────────────────────────────────────────────
const getResourcesDashboard = async (userRole = null) => {
  const types = ['HUMAN_RESOURCE', 'VEHICLE', 'EQUIPMENT', 'SUBCONSULTANT', 'OTHER'];
  const result = {};
  for (const type of types) {
    const resources = await Resource.findAll({ 
      where: { resource_type: type },
      include: [getProjectInclude(userRole)] 
    });
    const required    = resources.reduce((s, r) => s + parseInt(r.required_quantity    || 0), 0);
    const available   = resources.reduce((s, r) => s + parseInt(r.available_quantity   || 0), 0);
    const operational = resources.reduce((s, r) => s + parseInt(r.operational_quantity || 0), 0);
    const shortfall   = resources.reduce((s, r) => s + parseInt(r.shortfall            || 0), 0);
    result[type] = { required, available, operational, shortfall };
  }
  return result;
};

// ─── Risks Dashboard ─────────────────────────────────────────────────────────
const getRisksDashboard = async (userRole = null) => {
  const risks = await Risk.findAll({
    where: { status: { [Op.notIn]: ['CLOSED'] } },
    include: [getProjectInclude(userRole)],
    order: [['rating', 'DESC']],
  });
  return risks;
};

// ─── Issues Dashboard ────────────────────────────────────────────────────────
const getIssuesDashboard = async (userRole = null) => {
  const issues = await Issue.findAll({
    where: { status: { [Op.notIn]: ['CLOSED', 'RESOLVED'] } },
    include: [getProjectInclude(userRole)],
    order: [['severity', 'DESC']],
  });
  return issues;
};

// ─── Interventions Dashboard ──────────────────────────────────────────────────
const getInterventionsDashboard = async (userRole = null) => {
  const interventions = await Intervention.findAll({
    where: { status: { [Op.notIn]: ['COMPLETED', 'CANCELLED'] } },
    include: [
      getProjectInclude(userRole),
      { model: Risk,    attributes: ['id', 'risk_code', 'description'], required: false },
      { model: Issue,   attributes: ['id', 'issue_code', 'description'], required: false },
    ],
    order: [
      [literal(`CASE priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END`)],
      ['deadline', 'ASC'],
    ],
  });
  // Auto-flag overdue
  return interventions.map(i => ({
    ...i.toJSON(),
    is_overdue: isOverdue(i.deadline, i.status, ['COMPLETED', 'CANCELLED']),
  }));
};

// ─── Recovery Dashboard ───────────────────────────────────────────────────────
const getRecoveryDashboard = async (userRole = null) => {
  const plans = await RecoveryPlan.findAll({
    where: { recovery_status: { [Op.notIn]: ['COMPLETED'] } },
    include: [getProjectInclude(userRole)],
  });
  return plans;
};

// ─── Forward Look Dashboard ───────────────────────────────────────────────────
const getForwardLookDashboard = async (userRole = null) => {
  const items = await ForwardLook.findAll({
    include: [getProjectInclude(userRole)],
    order: [['expected_date', 'ASC']],
  });
  return {
    next_30: items.filter(i => i.period === 'NEXT_30_DAYS'),
    next_60: items.filter(i => i.period === 'NEXT_60_DAYS'),
    next_90: items.filter(i => i.period === 'NEXT_90_DAYS'),
  };
};

module.exports = {
  getOverview,
  getProjectStatus,
  getScheduleDashboard,
  getFinancialDashboard,
  getDeliverablesDashboard,
  getResourcesDashboard,
  getRisksDashboard,
  getIssuesDashboard,
  getInterventionsDashboard,
  getRecoveryDashboard,
  getForwardLookDashboard,
};
