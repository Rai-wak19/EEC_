import api from './api';

export const authService = {
  login:    (data) => api.post('/auth/login', data).then(r => r.data.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data.data),
  getMe:    ()     => api.get('/auth/me').then(r => r.data.data),
};

export const projectService = {
  getAll:   (params) => api.get('/projects', { params }).then(r => r.data.data),
  getById:  (id)     => api.get(`/projects/${id}`).then(r => r.data.data),
  create:   (data)   => api.post('/projects', data).then(r => r.data.data),
  update:   (id, d)  => api.put(`/projects/${id}`, d).then(r => r.data.data),
  remove:   (id)     => api.delete(`/projects/${id}`).then(r => r.data),
};

export const dashboardService = {
  getOverview:      () => api.get('/dashboard/overview').then(r => r.data.data),
  getProjectStatus: () => api.get('/dashboard/project-status').then(r => r.data.data),
  getSchedule:      () => api.get('/dashboard/schedule').then(r => r.data.data),
  getFinancial:     () => api.get('/dashboard/financial').then(r => r.data.data),
  getDeliverables:  () => api.get('/dashboard/deliverables').then(r => r.data.data),
  getResources:     () => api.get('/dashboard/resources').then(r => r.data.data),
  getRisks:         () => api.get('/dashboard/risks').then(r => r.data.data),
  getIssues:        () => api.get('/dashboard/issues').then(r => r.data.data),
  getInterventions: () => api.get('/dashboard/interventions').then(r => r.data.data),
  getRecovery:      () => api.get('/dashboard/recovery').then(r => r.data.data),
  getForwardLook:   () => api.get('/dashboard/forward-look').then(r => r.data.data),
};

const makeCrudService = (path) => ({
  getAll:  (params) => api.get(path, { params }).then(r => r.data.data),
  getById: (id)     => api.get(`${path}/${id}`).then(r => r.data.data),
  create:  (data)   => api.post(path, data).then(r => r.data.data),
  update:  (id, d)  => api.put(`${path}/${id}`, d).then(r => r.data.data),
  remove:  (id)     => api.delete(`${path}/${id}`).then(r => r.data),
});

export const progressService     = makeCrudService('/progress');
export const contractService      = makeCrudService('/contracts');
export const milestoneService     = makeCrudService('/milestones');
export const deliverableService   = makeCrudService('/deliverables');
export const financialService     = makeCrudService('/financials');
export const riskService          = makeCrudService('/risks');
export const issueService         = makeCrudService('/issues');
export const resourceService      = makeCrudService('/resources');
export const interventionService  = makeCrudService('/interventions');
export const recoveryService      = makeCrudService('/recovery');
export const forwardLookService   = makeCrudService('/forward-look');
export const userService          = makeCrudService('/users');
export const insuranceService     = makeCrudService('/insurances');
export const slaService           = makeCrudService('/slas');
export const slaDeliverableService = makeCrudService('/sla-deliverables');
export const slaMilestoneService  = makeCrudService('/sla-milestones');
