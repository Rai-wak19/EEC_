/**
 * seed.js — Seeds the database with realistic demo data.
 * Run with: npm run seed
 *
 * Includes:
 *   - 6 demo users (one per role)
 *   - 12 projects (5 GREEN, 4 YELLOW, 3 RED including IRAMS)
 *   - Progress, milestones, deliverables, financials, risks, issues,
 *     resources, interventions, recovery plans, forward-look records
 */
const bcrypt = require('bcryptjs');
const {
  sequelize, User, Project, Contract, ProjectProgress, Milestone,
  Deliverable, FinancialRecord, Risk, Issue, Resource,
  Intervention, RecoveryPlan, ForwardLook,
} = require('../src/models');
const { calcScheduleMetrics, calcRiskRating, calcFinancialMetrics, calcResourceShortfall } = require('../src/utils/calculations');

const D = (y, m, d) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const REPORT_MONTH = '2026-08-01'; // Current reporting month

async function seed() {
  console.log('🌱 Starting database seed...');
  await sequelize.sync({ force: false });

  // ─── Users ───────────────────────────────────────────────────────────────
  const hash = (pw) => bcrypt.hashSync(pw, 10);
  const users = await User.bulkCreate([
    { name: 'System Admin',      email: 'admin@eec.com',       password_hash: hash('Admin@123'),   role: 'ADMIN' },
    { name: 'James Thornton',    email: 'manager@eec.com',     password_hash: hash('Manager@123'), role: 'TRANSPORT_MANAGER' },
    { name: 'Sarah Mensah',      email: 'planning@eec.com',    password_hash: hash('Plan@123'),    role: 'PLANNING_MANAGER' },
    { name: 'Kofi Amponsah',     email: 'pm1@eec.com',         password_hash: hash('Pm1@123'),     role: 'PROJECT_MANAGER' },
    { name: 'Abena Osei',        email: 'finance@eec.com',     password_hash: hash('Finance@123'), role: 'FINANCE' },
    { name: 'David Asante',      email: 'viewer@eec.com',      password_hash: hash('View@123'),    role: 'VIEWER' },
    { name: 'Emmanuel Boateng',  email: 'pm2@eec.com',         password_hash: hash('Pm2@123'),     role: 'PROJECT_MANAGER' },
    { name: 'Ama Darko',         email: 'pm3@eec.com',         password_hash: hash('Pm3@123'),     role: 'PROJECT_MANAGER' },
  ], { returning: true });

  const [admin, jtm, sarah, kofi, abena, david, boateng, ama] = users;

  // ─── Projects ────────────────────────────────────────────────────────────
  // Statuses (by SPI):
  //   GREEN  (SPI >= 0.95): P01, P02, P03, P04, P05
  //   YELLOW (0.80–0.95):   P06, P07, P08, P09
  //   RED    (SPI < 0.80):  P10, P11(IRAMS), P12

  const projectDefs = [
    // GREEN Projects
    { project_code:'TSP-001', project_name:'National Highways Rehabilitation',  client:'Ministry of Roads', employer:'MoR', contract_no:'MOR/2024/001', consultant:'EEC Transport', responsible_team:'Roads Team A', pm_id: kofi.id,    commencement_date:D(2024,3,1),  completion_date:D(2026,9,30),  duration_months:30, contract_value:12500000, currency:'USD', planned:72, actual:71 },
    { project_code:'TSP-002', project_name:'Accra Urban Transit Improvement',   client:'Metropolitan Auth', employer:'Metro', contract_no:'MA/2024/015',  consultant:'EEC Transport', responsible_team:'Urban Team',  pm_id: boateng.id, commencement_date:D(2024,6,1),  completion_date:D(2026,11,30), duration_months:30, contract_value:8750000,  currency:'USD', planned:55, actual:54 },
    { project_code:'TSP-003', project_name:'Eastern Corridor Road Safety',      client:'NRSA',             employer:'NRSA',  contract_no:'NRSA/2025/003', consultant:'EEC Transport', responsible_team:'Safety Team', pm_id: ama.id,     commencement_date:D(2025,1,15), completion_date:D(2026,12,31), duration_months:24, contract_value:5200000,  currency:'USD', planned:68, actual:67 },
    { project_code:'TSP-004', project_name:'Port Access Road Upgrade',          client:'Ghana Ports',      employer:'GPHA',  contract_no:'GPHA/2024/008', consultant:'EEC Transport', responsible_team:'Ports Team',  pm_id: kofi.id,    commencement_date:D(2024,4,1),  completion_date:D(2026,9,30),  duration_months:30, contract_value:9800000,  currency:'USD', planned:80, actual:79 },
    { project_code:'TSP-005', project_name:'Rural Feeder Roads Phase 2',        client:'DRAP',             employer:'DRAP',  contract_no:'DRAP/2025/001', consultant:'EEC Transport', responsible_team:'Rural Team',  pm_id: boateng.id, commencement_date:D(2025,2,1),  completion_date:D(2027,1,31),  duration_months:24, contract_value:6300000,  currency:'USD', planned:45, actual:44 },
    // YELLOW Projects
    { project_code:'TSP-006', project_name:'Bridge Maintenance Program',        client:'GHA',              employer:'GHA',   contract_no:'GHA/2024/012',  consultant:'EEC Transport', responsible_team:'Bridges Team',pm_id: ama.id,     commencement_date:D(2024,7,1),  completion_date:D(2026,12,31), duration_months:30, contract_value:14200000, currency:'USD', planned:58, actual:51 },
    { project_code:'TSP-007', project_name:'Traffic Management System Kumasi',  client:'KMA',              employer:'KMA',   contract_no:'KMA/2025/004',  consultant:'EEC Transport', responsible_team:'ITS Team',    pm_id: kofi.id,    commencement_date:D(2025,3,1),  completion_date:D(2027,2,28),  duration_months:24, contract_value:7100000,  currency:'USD', planned:35, actual:30 },
    { project_code:'TSP-008', project_name:'Northern Corridor Infrastructure',  client:'KEEA',             employer:'KEEA',  contract_no:'KEEA/2024/009', consultant:'EEC Transport', responsible_team:'North Team',  pm_id: boateng.id, commencement_date:D(2024,8,1),  completion_date:D(2026,10,31), duration_months:27, contract_value:18500000, currency:'USD', planned:75, actual:65 },
    { project_code:'TSP-009', project_name:'Pedestrian Walkway Network Accra',  client:'AMA',              employer:'AMA',   contract_no:'AMA/2025/007',  consultant:'EEC Transport', responsible_team:'Urban Team',  pm_id: ama.id,     commencement_date:D(2025,1,1),  completion_date:D(2026,12,31), duration_months:24, contract_value:3900000,  currency:'USD', planned:52, actual:44 },
    // RED Projects
    { project_code:'TSP-010', project_name:'Volta River Bridge Construction',   client:'MoR',              employer:'MoR',   contract_no:'MOR/2023/044',  consultant:'EEC Transport', responsible_team:'Bridges Team',pm_id: kofi.id,    commencement_date:D(2023,9,1),  completion_date:D(2026,8,31),  duration_months:36, contract_value:32000000, currency:'USD', planned:88, actual:68 },
    { project_code:'IRAMS',   project_name:'Integrated Road Asset Mgmt System', client:'MoR',              employer:'MoR',   contract_no:'MOR/2024/IRAMS', consultant:'EEC Transport', responsible_team:'ICT Team',   pm_id: boateng.id, commencement_date:D(2024,2,1),  completion_date:D(2026,8,31),  duration_months:30, contract_value:4750000,  currency:'USD', planned:54.4,actual:28.5},
    { project_code:'TSP-012', project_name:'Tema Motorway Expansion',           client:'NRA',              employer:'NRA',   contract_no:'NRA/2023/019',  consultant:'EEC Transport', responsible_team:'Roads Team B',pm_id: ama.id,     commencement_date:D(2023,6,1),  completion_date:D(2026,9,30),  duration_months:40, contract_value:48000000, currency:'USD', planned:78, actual:54 },
  ];

  const projects = [];
  for (const def of projectDefs) {
    const p = await Project.create({
      project_code: def.project_code,
      project_name: def.project_name,
      client: def.client,
      employer: def.employer,
      contract_no: def.contract_no,
      consultant: def.consultant,
      responsible_team: def.responsible_team,
      project_manager_id: def.pm_id,
      commencement_date: def.commencement_date,
      completion_date: def.completion_date,
      duration_months: def.duration_months,
      contract_value: def.contract_value,
      currency: def.currency,
      project_status: 'ACTIVE',
    });
    // Historical progress (3 months)
    const months = [D(2026,6,1), D(2026,7,1), REPORT_MONTH];
    const planSteps = [def.planned - 12, def.planned - 6, def.planned];
    const actualGap = def.actual - def.planned;
    for (let i = 0; i < months.length; i++) {
      const pl = Math.max(0, planSteps[i]);
      const ac = Math.max(0, pl + actualGap);
      const { schedule_variance, spi } = calcScheduleMetrics(pl, ac);
      await ProjectProgress.create({ project_id: p.id, reporting_month: months[i], planned_progress: pl, actual_progress: ac, schedule_variance, spi, time_elapsed_percent: pl, time_remaining_percent: 100 - pl });
    }
    projects.push({ model: p, def });
  }

  const pmap = {};
  projects.forEach(({ model, def }) => { pmap[def.project_code] = model; });
  const irams = pmap['IRAMS'];
  const volta = pmap['TSP-010'];
  const tema  = pmap['TSP-012'];

  // ─── Contracts ─────────────────────────────────────────────────────────
  for (const { model, def } of projects) {
    const m = calcFinancialMetrics({ original_contract_value: def.contract_value, variation_value: def.contract_value * 0.05 });
    await Contract.create({
      project_id: model.id,
      contract_no: def.contract_no,
      contract_title: def.project_name + ' — Main Contract',
      client: def.client,
      contractor_or_consultant: 'EEC Transport Consultants Ltd',
      original_contract_value: def.contract_value,
      variation_value: parseFloat((def.contract_value * 0.05).toFixed(2)),
      revised_contract_value: m.revised_contract_value,
      currency: def.currency,
      contract_start_date: def.commencement_date,
      contract_end_date: def.completion_date,
      contract_status: 'ACTIVE',
    });
  }

  // ─── Financial Records ────────────────────────────────────────────────
  const financialData = [
    // [project_code, amount_received_pct, planned_invoice_pct, actual_invoice_pct, certified_pct]
    ['TSP-001', 70, 72, 70, 71], ['TSP-002', 52, 55, 52, 53], ['TSP-003', 65, 68, 66, 66],
    ['TSP-004', 78, 80, 78, 79], ['TSP-005', 43, 45, 44, 44], ['TSP-006', 45, 58, 49, 50],
    ['TSP-007', 26, 35, 28, 28], ['TSP-008', 60, 75, 62, 63], ['TSP-009', 40, 52, 42, 43],
    ['TSP-010', 60, 88, 65, 67], ['IRAMS',   25, 54, 27, 28], ['TSP-012', 48, 78, 50, 52],
  ];
  for (const [code, rcvPct, planPct, actPct, certPct] of financialData) {
    const proj = pmap[code];
    if (!proj) continue;
    const cv = parseFloat(proj.contract_value);
    const var_ = parseFloat((cv * 0.05).toFixed(2));
    const rcv = parseFloat((cv * 1.05).toFixed(2));
    await FinancialRecord.create({
      project_id: proj.id, reporting_month: REPORT_MONTH,
      original_contract_value: cv, variation_value: var_, revised_contract_value: rcv,
      planned_invoicing:  parseFloat((rcv * planPct / 100).toFixed(2)),
      actual_invoicing:   parseFloat((rcv * actPct  / 100).toFixed(2)),
      amount_certified:   parseFloat((rcv * certPct / 100).toFixed(2)),
      amount_received:    parseFloat((rcv * rcvPct  / 100).toFixed(2)),
      outstanding_payment:parseFloat((rcv * (certPct - rcvPct) / 100).toFixed(2)),
      planned_cost:  parseFloat((rcv * planPct / 100 * 0.85).toFixed(2)),
      actual_cost:   parseFloat((rcv * actPct  / 100 * 0.88).toFixed(2)),
      forecast_cost: parseFloat((rcv * 0.92).toFixed(2)),
    });
  }

  // ─── Milestones ───────────────────────────────────────────────────────
  await Milestone.bulkCreate([
    { project_id: irams.id, name:'Software Requirements Specification', planned_date:D(2025,6,30), actual_date:D(2025,9,15), status:'COMPLETED',    is_critical:true,  responsible_person:'Boateng E.' },
    { project_id: irams.id, name:'System Architecture Design',          planned_date:D(2025,9,30), actual_date:D(2026,1,20), status:'COMPLETED',    is_critical:true,  responsible_person:'Boateng E.' },
    { project_id: irams.id, name:'RAMS Module Development',             planned_date:D(2026,3,31), status:'DELAYED',         is_critical:true,  responsible_person:'Boateng E.', notes:'Procurement delay of RAMS software license' },
    { project_id: irams.id, name:'User Acceptance Testing',             planned_date:D(2026,6,30), status:'AT_RISK',         is_critical:true,  responsible_person:'Boateng E.' },
    { project_id: irams.id, name:'System Deployment',                   planned_date:D(2026,8,31), status:'AT_RISK',         is_critical:true,  responsible_person:'Boateng E.' },
    { project_id: volta.id, name:'Foundation Works Completion',         planned_date:D(2025,12,31),actual_date:D(2026,2,28), status:'COMPLETED',   is_critical:true,  responsible_person:'Kofi A.' },
    { project_id: volta.id, name:'Bridge Deck Construction 50%',        planned_date:D(2026,5,31), actual_date:null,         status:'DELAYED',     is_critical:true,  responsible_person:'Kofi A.', notes:'Material supply issues from contractor' },
    { project_id: volta.id, name:'Bridge Deck Completion',              planned_date:D(2026,7,31), status:'DELAYED',         is_critical:true,  responsible_person:'Kofi A.' },
    { project_id: tema.id,  name:'Design Approval',                     planned_date:D(2024,9,30), actual_date:D(2025,1,15), status:'COMPLETED',   is_critical:false, responsible_person:'Ama D.' },
    { project_id: tema.id,  name:'Mobilisation Complete',               planned_date:D(2025,1,31), actual_date:D(2025,4,30), status:'COMPLETED',   is_critical:true,  responsible_person:'Ama D.' },
    { project_id: tema.id,  name:'Phase 1 Earthworks',                  planned_date:D(2026,3,31), status:'DELAYED',         is_critical:true,  responsible_person:'Ama D.' },
    // GREEN project milestones (on track)
    { project_id: pmap['TSP-001'].id, name:'Pavement Design Approval',  planned_date:D(2025,12,31), actual_date:D(2025,12,15), status:'COMPLETED', is_critical:true,  responsible_person:'Kofi A.' },
    { project_id: pmap['TSP-001'].id, name:'Rehabilitation 50% Complete', planned_date:D(2026,6,30), actual_date:D(2026,6,25), status:'COMPLETED', is_critical:true,  responsible_person:'Kofi A.' },
    { project_id: pmap['TSP-001'].id, name:'Project Completion',         planned_date:D(2026,9,30), status:'IN_PROGRESS',      is_critical:true,  responsible_person:'Kofi A.' },
  ]);

  // ─── Deliverables ─────────────────────────────────────────────────────
  await Deliverable.bulkCreate([
    { project_id: irams.id, name:'Inception Report',               category:'REPORT',         planned_date:D(2024,4,30), actual_date:D(2024,5,15), status:'COMPLETED', is_critical:true,  responsible_person:'Boateng E.' },
    { project_id: irams.id, name:'Road Asset Inventory Database',  category:'SOFTWARE',       planned_date:D(2025,12,31),actual_date:null,         status:'DELAYED',   is_critical:true,  responsible_person:'Boateng E.', description:'RAMS software procurement delay' },
    { project_id: irams.id, name:'Stakeholder Training Module 1',  category:'TRAINING',       planned_date:D(2026,5,31), actual_date:null,         status:'AT_RISK',   is_critical:false, responsible_person:'Boateng E.' },
    { project_id: irams.id, name:'System User Manual',             category:'DOCUMENTATION',  planned_date:D(2026,7,31), status:'PLANNED',         is_critical:false, responsible_person:'Boateng E.' },
    { project_id: volta.id, name:'Geotechnical Survey Report',     category:'SURVEY',         planned_date:D(2024,3,31), actual_date:D(2024,4,15), status:'COMPLETED', is_critical:false, responsible_person:'Kofi A.' },
    { project_id: volta.id, name:'Structural Design Report',       category:'DESIGN',         planned_date:D(2024,9,30), actual_date:D(2024,10,5), status:'COMPLETED', is_critical:true,  responsible_person:'Kofi A.' },
    { project_id: volta.id, name:'Monthly Progress Report Aug 26', category:'REPORT',         planned_date:D(2026,8,15), actual_date:null,         status:'DELAYED',   is_critical:false, responsible_person:'Kofi A.' },
    { project_id: pmap['TSP-001'].id, name:'Inception Report',     category:'REPORT',         planned_date:D(2024,4,30), actual_date:D(2024,4,28), status:'COMPLETED', is_critical:false, responsible_person:'Kofi A.' },
    { project_id: pmap['TSP-001'].id, name:'Pavement Assessment',  category:'SURVEY',         planned_date:D(2024,8,31), actual_date:D(2024,8,20), status:'COMPLETED', is_critical:true,  responsible_person:'Kofi A.' },
    { project_id: pmap['TSP-001'].id, name:'Final Design Report',  category:'DESIGN',         planned_date:D(2025,2,28), actual_date:D(2025,2,25), status:'COMPLETED', is_critical:true,  responsible_person:'Kofi A.' },
    { project_id: pmap['TSP-001'].id, name:'Completion Report',    category:'REPORT',         planned_date:D(2026,10,31),status:'IN_PROGRESS',      is_critical:true,  responsible_person:'Kofi A.' },
    { project_id: tema.id, name:'Feasibility Study',               category:'REPORT',         planned_date:D(2024,3,31), actual_date:D(2024,4,30), status:'COMPLETED', is_critical:false, responsible_person:'Ama D.' },
    { project_id: tema.id, name:'Environmental Impact Assessment',  category:'REPORT',         planned_date:D(2024,6,30), actual_date:D(2024,8,31), status:'COMPLETED', is_critical:true,  responsible_person:'Ama D.' },
    { project_id: tema.id, name:'Detailed Engineering Design',      category:'DESIGN',         planned_date:D(2025,6,30), actual_date:null,         status:'DELAYED',   is_critical:true,  responsible_person:'Ama D.' },
  ]);

  // ─── Risks ────────────────────────────────────────────────────────────
  const riskDefs = [
    { project_id: irams.id,  risk_code:'R-IRAMS-01', description:'RAMS software license procurement may fail/be rejected', category:'Procurement', probability:'HIGH', impact:'HIGH', mitigation_action:'Identify alternative COTS RAMS vendors; prepare contingency procurement plan', responsible_person:'Boateng E.', target_date:D(2026,8,30), status:'ESCALATED' },
    { project_id: irams.id,  risk_code:'R-IRAMS-02', description:'Key ICT staff attrition risk during system development', category:'HR', probability:'MEDIUM', impact:'HIGH', mitigation_action:'Retention package and cross-training of junior staff', responsible_person:'Boateng E.', target_date:D(2026,9,30), status:'OPEN' },
    { project_id: volta.id,  risk_code:'R-VOL-01',   description:'Contractor material supply chain disruption',          category:'Supply Chain', probability:'HIGH', impact:'HIGH', mitigation_action:'Activate alternative material suppliers; escalate to Ministry', responsible_person:'Kofi A.',    target_date:D(2026,9,15), status:'ESCALATED' },
    { project_id: volta.id,  risk_code:'R-VOL-02',   description:'Flooding risk to bridge construction zone',           category:'Environmental', probability:'MEDIUM', impact:'HIGH', mitigation_action:'Implement flood protection measures; monitor river levels', responsible_person:'Kofi A.', target_date:D(2026,10,31), status:'OPEN' },
    { project_id: tema.id,   risk_code:'R-TEM-01',   description:'Right-of-way acquisition delays along motorway',       category:'Legal', probability:'HIGH', impact:'HIGH', mitigation_action:'Engage Ministry of Lands; prioritize ROW compensation', responsible_person:'Ama D.', target_date:D(2026,9,30), status:'OPEN' },
    { project_id: pmap['TSP-006'].id, risk_code:'R-BMP-01', description:'Subcontractor bridge inspection quality issues', category:'Quality', probability:'MEDIUM', impact:'MEDIUM', mitigation_action:'Increase independent QA inspections', responsible_person:'Ama D.', target_date:D(2026,9,30), status:'MITIGATING' },
    { project_id: pmap['TSP-008'].id, risk_code:'R-NCI-01', description:'Community resistance to infrastructure access',  category:'Social', probability:'MEDIUM', impact:'MEDIUM', mitigation_action:'Escalate community liaison; engage local chiefs', responsible_person:'Boateng E.', target_date:D(2026,10,31), status:'OPEN' },
    { project_id: pmap['TSP-001'].id, risk_code:'R-NHR-01', description:'Rainy season delays to surfacing works',         category:'Environmental', probability:'LOW', impact:'MEDIUM', mitigation_action:'Adjust programme; work in drier periods', responsible_person:'Kofi A.', target_date:D(2026,9,15), status:'MITIGATING' },
  ];
  for (const def of riskDefs) {
    const { score } = calcRiskRating(def.probability, def.impact);
    await Risk.create({ ...def, rating: score });
  }

  // ─── Issues ───────────────────────────────────────────────────────────
  await Issue.bulkCreate([
    { project_id: irams.id,  issue_code:'I-IRAMS-01', description:'RAMS software procurement stalled — no vendor selected after 8 months', category:'Procurement', severity:'CRITICAL', impact:'Critical path delay of 5+ months; entire IRAMS delivery at risk',      action_required:'Management to approve alternative procurement strategy immediately', responsible_person:'Boateng E.', target_date:D(2026,8,30), status:'ESCALATED' },
    { project_id: irams.id,  issue_code:'I-IRAMS-02', description:'Client review comments on SRS outstanding for 3 months',              category:'Client',      severity:'HIGH',     impact:'Blocking detailed design; causing cascade delays',                       action_required:'Schedule urgent client meeting; set firm response deadline',        responsible_person:'Boateng E.', target_date:D(2026,8,15), status:'OPEN' },
    { project_id: volta.id,  issue_code:'I-VOL-01',   description:'Steel reinforcement supply shortfall — contractor unable to procure',   category:'Supply Chain', severity:'CRITICAL', impact:'Bridge deck construction halted; 3 month delay to completion forecast',   action_required:'Emergency procurement of alternative steel supplier approved by MoR',responsible_person:'Kofi A.',    target_date:D(2026,8,25), status:'IN_PROGRESS' },
    { project_id: tema.id,   issue_code:'I-TEM-01',   description:'ROW parcels — 45 plots not yet compensated; access blocked',           category:'Legal',       severity:'HIGH',     impact:'Earthworks on 12km section cannot proceed; 6-month programme delay',       action_required:'MoR to release ROW compensation funds urgently',                   responsible_person:'Ama D.',    target_date:D(2026,9,15), status:'OPEN' },
    { project_id: pmap['TSP-008'].id, issue_code:'I-NCI-01', description:'Community roadblocks preventing equipment access at Tamale site',category:'Social',      severity:'HIGH',     impact:'Works suspended on 8km section; delay accumulating',                      action_required:'Regional coordinating council to mediate',                         responsible_person:'Boateng E.', target_date:D(2026,8,20), status:'IN_PROGRESS' },
    { project_id: pmap['TSP-006'].id, issue_code:'I-BMP-01', description:'Defective bearing plates identified on 3 bridges',             category:'Technical',    severity:'HIGH',     impact:'Safety risk; remedial works required before continuing',                  action_required:'Structural engineer review and approve remedial design',           responsible_person:'Ama D.', target_date:D(2026,8,31), status:'IN_PROGRESS' },
  ]);

  // ─── Resources ────────────────────────────────────────────────────────
  await Resource.bulkCreate([
    { project_id: irams.id, resource_type:'HUMAN_RESOURCE', resource_name:'Senior Software Engineers', required_quantity:5, available_quantity:3, operational_quantity:3, shortfall:2, status:'SHORTAGE', notes:'2 positions vacant; recruitment in progress' },
    { project_id: irams.id, resource_type:'EQUIPMENT',      resource_name:'Development Servers',       required_quantity:4, available_quantity:2, operational_quantity:2, shortfall:2, status:'SHORTAGE', notes:'Procurement pending Ministry approval' },
    { project_id: volta.id, resource_type:'HUMAN_RESOURCE', resource_name:'Bridge Engineers',          required_quantity:8, available_quantity:6, operational_quantity:6, shortfall:2, status:'PARTIAL' },
    { project_id: volta.id, resource_type:'VEHICLE',        resource_name:'Heavy Duty Vehicles',       required_quantity:20, available_quantity:14, operational_quantity:12, shortfall:6, status:'SHORTAGE', notes:'6 vehicles breakdown — under repair' },
    { project_id: volta.id, resource_type:'EQUIPMENT',      resource_name:'Tower Cranes',              required_quantity:3, available_quantity:2, operational_quantity:2, shortfall:1, status:'PARTIAL' },
    { project_id: tema.id,  resource_type:'HUMAN_RESOURCE', resource_name:'Site Engineers',            required_quantity:12, available_quantity:9, operational_quantity:8, shortfall:3, status:'PARTIAL' },
    { project_id: tema.id,  resource_type:'VEHICLE',        resource_name:'Construction Vehicles',     required_quantity:35, available_quantity:22, operational_quantity:19, shortfall:13, status:'SHORTAGE', notes:'ROW issue limiting equipment deployment to site' },
    { project_id: pmap['TSP-001'].id, resource_type:'HUMAN_RESOURCE', resource_name:'Road Engineers', required_quantity:6, available_quantity:6, operational_quantity:6, shortfall:0, status:'ADEQUATE' },
    { project_id: pmap['TSP-001'].id, resource_type:'VEHICLE', resource_name:'Road Construction Vehicles', required_quantity:15, available_quantity:14, operational_quantity:13, shortfall:1, status:'ADEQUATE' },
  ]);

  // ─── Interventions ────────────────────────────────────────────────────
  const irams_risk = await Risk.findOne({ where: { project_id: irams.id, risk_code: 'R-IRAMS-01' } });
  const irams_issue = await Issue.findOne({ where: { project_id: irams.id, issue_code: 'I-IRAMS-01' } });
  const volta_issue = await Issue.findOne({ where: { project_id: volta.id, issue_code: 'I-VOL-01' } });
  const tema_issue  = await Issue.findOne({ where: { project_id: tema.id,  issue_code: 'I-TEM-01' } });

  await Intervention.bulkCreate([
    {
      project_id: irams.id, risk_id: irams_risk?.id, issue_id: irams_issue?.id,
      priority: 'CRITICAL',
      problem: 'RAMS software procurement has stalled for 8 months. No vendor selected. Critical path delay of 5+ months threatens project delivery by August 2026 deadline.',
      impact: 'IRAMS project will fail to deliver by contract end date. Risk of contract termination and reputational damage.',
      required_decision: 'Approve alternative procurement strategy: Direct contracting with pre-qualified RAMS vendor under emergency procurement rules.',
      responsible_person: 'James Thornton (Transport Manager)',
      deadline: D(2026,8,30), status: 'PENDING',
    },
    {
      project_id: volta.id, issue_id: volta_issue?.id,
      priority: 'CRITICAL',
      problem: 'Steel reinforcement supply to Volta River Bridge site has halted. Contractor unable to source from original supplier. Bridge deck construction suspended.',
      impact: '3-month delay to bridge completion. August 2026 deadline cannot be met. Financial penalties may apply.',
      required_decision: 'Approve emergency procurement of alternative steel supplier and cost variation.',
      responsible_person: 'James Thornton (Transport Manager)',
      deadline: D(2026,8,25), status: 'IN_PROGRESS',
    },
    {
      project_id: tema.id, issue_id: tema_issue?.id,
      priority: 'HIGH',
      problem: '45 ROW plots uncompensated. Communities blocking access to 12km section of Tema Motorway. Works suspended.',
      impact: '6-month programme delay. Financial penalties projected at USD 1.2M if completion date is not extended.',
      required_decision: 'Ministry of Roads to urgently release ROW compensation funds (USD 850,000) and approve time extension.',
      responsible_person: 'James Thornton (Transport Manager)',
      deadline: D(2026,9,15), status: 'PENDING',
    },
    {
      project_id: pmap['TSP-006'].id,
      priority: 'HIGH',
      problem: 'Defective bearing plates discovered on 3 bridges during inspection. Structural safety concern.',
      impact: 'Works must be suspended until remedial design approved. Delay to programme.',
      required_decision: 'Approve emergency structural review and remedial works contract variation.',
      responsible_person: 'Sarah Mensah (Planning Manager)',
      deadline: D(2026,8,31), status: 'IN_PROGRESS',
    },
    {
      project_id: pmap['TSP-008'].id,
      priority: 'MEDIUM',
      problem: 'Community roadblocks at Tamale site preventing equipment access for 3 weeks.',
      impact: 'Works suspended on 8km section. Schedule slipping further.',
      required_decision: 'Authorize Regional Coordinating Council mediation and community compensation package.',
      responsible_person: 'Sarah Mensah (Planning Manager)',
      deadline: D(2026,8,20), status: 'IN_PROGRESS',
    },
  ]);

  // ─── Recovery Plans ───────────────────────────────────────────────────
  await RecoveryPlan.bulkCreate([
    {
      project_id: irams.id,
      original_gap: -25.9, recovery_target_gap: -10.0, current_gap: -25.9,
      recovery_status: 'NOT_STARTED',
      recovery_action: '1. Resolve software procurement immediately.\n2. Mobilize additional ICT staff.\n3. Implement accelerated development sprints.\n4. Fast-track UAT process.',
      responsible_person: 'Boateng E.', target_date: D(2026,8,31),
      notes: 'Recovery cannot commence until procurement decision is made.',
    },
    {
      project_id: volta.id,
      original_gap: -20.0, recovery_target_gap: -8.0, current_gap: -20.0,
      recovery_status: 'AT_RISK',
      recovery_action: '1. Emergency procurement of alternative steel supplier.\n2. Increase workforce by 30%.\n3. Extended working hours (7 days/week).\n4. Seek time extension from client.',
      responsible_person: 'Kofi A.', target_date: D(2026,9,30),
    },
    {
      project_id: tema.id,
      original_gap: -24.0, recovery_target_gap: -12.0, current_gap: -24.0,
      recovery_status: 'NOT_STARTED',
      recovery_action: '1. Urgently resolve ROW issues with Ministry support.\n2. Mobilize additional earth-moving equipment.\n3. Accelerate works on unaffected sections.',
      responsible_person: 'Ama D.', target_date: D(2026,10,31),
      notes: 'Recovery blocked by ROW issue.',
    },
  ]);

  // ─── Forward Look ─────────────────────────────────────────────────────
  await ForwardLook.bulkCreate([
    // IRAMS — Next 30 days (critical)
    { project_id: irams.id, period: 'NEXT_30_DAYS', category: 'DECISION', description: 'Management decision on alternative RAMS procurement strategy required', expected_date: D(2026,8,30), responsible_person: 'Transport Manager', status: 'PENDING',  impact: 'Critical — project delivery at risk without this decision' },
    { project_id: irams.id, period: 'NEXT_30_DAYS', category: 'PROCUREMENT', description: 'Issue RFP to pre-qualified RAMS vendors if decision approved', expected_date: D(2026,9,5),  responsible_person: 'Boateng E.', status: 'PENDING', impact: 'High' },
    { project_id: irams.id, period: 'NEXT_60_DAYS', category: 'MILESTONE',    description: 'Commence RAMS module development with new vendor', expected_date: D(2026,10,1), responsible_person: 'Boateng E.', status: 'PENDING', impact: 'High' },
    { project_id: irams.id, period: 'NEXT_90_DAYS', category: 'RISK',         description: 'Review delivery feasibility — consider time extension request', expected_date: D(2026,10,31), responsible_person: 'Boateng E.', status: 'PENDING', impact: 'High' },
    // Volta River Bridge
    { project_id: volta.id, period: 'NEXT_30_DAYS', category: 'DECISION', description: 'Confirm alternative steel supplier and approve emergency variation order', expected_date: D(2026,8,25), responsible_person: 'Transport Manager', status: 'PENDING', impact: 'Critical' },
    { project_id: volta.id, period: 'NEXT_30_DAYS', category: 'MILESTONE', description: 'Resume bridge deck construction after steel supply restored', expected_date: D(2026,9,10), responsible_person: 'Kofi A.', status: 'PENDING', impact: 'Critical' },
    { project_id: volta.id, period: 'NEXT_60_DAYS', category: 'CONTRACTUAL_DEADLINE', description: 'Contract completion date review with MoR — time extension submission', expected_date: D(2026,9,30), responsible_person: 'Kofi A.', status: 'PENDING', impact: 'High' },
    // Tema Motorway
    { project_id: tema.id, period: 'NEXT_30_DAYS', category: 'DECISION', description: 'Ministry of Roads to release ROW compensation funds — urgent', expected_date: D(2026,9,15), responsible_person: 'Transport Manager', status: 'PENDING', impact: 'Critical' },
    { project_id: tema.id, period: 'NEXT_60_DAYS', category: 'MILESTONE', description: 'Commence earthworks on cleared ROW sections', expected_date: D(2026,10,15), responsible_person: 'Ama D.', status: 'PENDING', impact: 'High' },
    // GREEN project forward look
    { project_id: pmap['TSP-001'].id, period: 'NEXT_30_DAYS', category: 'INVOICE', description: 'Interim Payment Certificate #8 — USD 850,000 expected', expected_date: D(2026,9,5), responsible_person: 'Abena O.', status: 'PENDING', impact: 'Medium' },
    { project_id: pmap['TSP-001'].id, period: 'NEXT_30_DAYS', category: 'MILESTONE', description: 'Pavement wearing course application — final 15km', expected_date: D(2026,9,20), responsible_person: 'Kofi A.', status: 'PENDING', impact: 'High' },
    { project_id: pmap['TSP-001'].id, period: 'NEXT_60_DAYS', category: 'MILESTONE', description: 'Project completion and handover to client', expected_date: D(2026,9,30), responsible_person: 'Kofi A.', status: 'PENDING', impact: 'High' },
    { project_id: pmap['TSP-004'].id, period: 'NEXT_30_DAYS', category: 'INVOICE', description: 'Invoice #7 submission — USD 720,000', expected_date: D(2026,9,1), responsible_person: 'Abena O.', status: 'PENDING', impact: 'Medium' },
    { project_id: pmap['TSP-008'].id, period: 'NEXT_30_DAYS', category: 'RESOURCE', description: 'Mobilize 3 additional site engineers for Northern Corridor', expected_date: D(2026,9,1), responsible_person: 'Boateng E.', status: 'PENDING', impact: 'Medium' },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('   admin@eec.com         / Admin@123    (ADMIN)');
  console.log('   manager@eec.com       / Manager@123  (TRANSPORT_MANAGER)');
  console.log('   planning@eec.com      / Plan@123     (PLANNING_MANAGER)');
  console.log('   pm1@eec.com           / Pm1@123      (PROJECT_MANAGER)');
  console.log('   finance@eec.com       / Finance@123  (FINANCE)');
  console.log('   viewer@eec.com        / View@123     (VIEWER)');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message, err.stack);
  process.exit(1);
});
