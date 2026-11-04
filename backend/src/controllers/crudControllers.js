const {
  progressService, contractService, milestoneService, deliverableService,
  financialService, riskService, issueService, resourceService,
  interventionService, recoveryService, forwardLookService, userService, insuranceService,
  slaService, slaDeliverableService, slaMilestoneService,
} = require('../services/crudServices');
const { makeController } = require('./controllerFactory');

// ─── Helper to build controller object from a service ─────────────────────────
const makeCrud = (svc, projectIdFromParam = false) => ({
  getAll:  makeController((req) => svc.getAll(projectIdFromParam ? req.params.projectId : req.query.project_id, req.user?.role)),
  getById: makeController((req) => svc.getById(req.params.id, req.user?.role)),
  create:  makeController((req) => svc.create(req.body)),
  update:  makeController((req) => svc.update(req.params.id, req.body)),
  remove:  makeController(async (req, res) => {
    await svc.remove(req.params.id);
    res.json({ success: true, message: 'Record deleted.' });
  }),
});

module.exports = {
  progressController:     makeCrud(progressService),
  contractController:     makeCrud(contractService),
  milestoneController:    makeCrud(milestoneService),
  deliverableController:  makeCrud(deliverableService),
  financialController:    makeCrud(financialService),
  riskController:         makeCrud(riskService),
  issueController:        makeCrud(issueService),
  resourceController:     makeCrud(resourceService),
  interventionController: makeCrud(interventionService),
  recoveryController:     makeCrud(recoveryService),
  forwardLookController:  makeCrud(forwardLookService),
  insuranceController:    makeCrud(insuranceService),
  slaController:          makeCrud(slaService),
  slaDeliverableController: makeCrud(slaDeliverableService),
  slaMilestoneController: makeCrud(slaMilestoneService),
  userController:         {
    getAll:  makeController(() => userService.getAll()),
    getById: makeController((req) => userService.getById(req.params.id)),
    update:  makeController((req) => userService.update(req.params.id, req.body)),
    remove:  makeController(async (req, res) => {
      await userService.remove(req.params.id);
      res.json({ success: true, message: 'User deleted.' });
    }),
  },
};
