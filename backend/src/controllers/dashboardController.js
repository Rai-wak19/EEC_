const dashboardService = require('../services/dashboardService');
const { makeController } = require('./controllerFactory');

module.exports = {
  overview:          makeController((req) => dashboardService.getOverview(req.user?.role)),
  projectStatus:     makeController((req) => dashboardService.getProjectStatus(req.user?.role)),
  schedule:          makeController((req) => dashboardService.getScheduleDashboard(req.user?.role)),
  financial:         makeController((req) => dashboardService.getFinancialDashboard(req.user?.role)),
  deliverables:      makeController((req) => dashboardService.getDeliverablesDashboard(req.user?.role)),
  resources:         makeController((req) => dashboardService.getResourcesDashboard(req.user?.role)),
  risks:             makeController((req) => dashboardService.getRisksDashboard(req.user?.role)),
  issues:            makeController((req) => dashboardService.getIssuesDashboard(req.user?.role)),
  interventions:     makeController((req) => dashboardService.getInterventionsDashboard(req.user?.role)),
  recovery:          makeController((req) => dashboardService.getRecoveryDashboard(req.user?.role)),
  forwardLook:       makeController((req) => dashboardService.getForwardLookDashboard(req.user?.role)),
};
