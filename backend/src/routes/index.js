const router = require('express').Router();
const { authenticate, optionalAuthenticate, authorize } = require('../middleware/auth');
const {
  progressController, contractController, milestoneController,
  deliverableController, financialController, riskController,
  issueController, resourceController, interventionController,
  recoveryController, forwardLookController, userController, insuranceController,
  slaController, slaDeliverableController, slaMilestoneController,
} = require('../controllers/crudControllers');

const ALL   = ['ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER', 'PROJECT_MANAGER', 'FINANCE', 'VIEWER'];
const WRITE = ['ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER', 'PROJECT_MANAGER'];
const FIN   = ['ADMIN', 'TRANSPORT_MANAGER', 'FINANCE'];
const ADMIN = ['ADMIN'];

// Helper to register standard CRUD routes on a router
const crudRoutes = (r, ctrl, readRoles, writeRoles, deleteRoles = ['ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER']) => {
  r.get('/',     ctrl.getAll);
  r.get('/:id',  ctrl.getById);
  r.post('/',    authorize(...writeRoles),  ctrl.create);
  r.put('/:id',  authorize(...writeRoles),  ctrl.update);
  r.delete('/:id', authorize(...deleteRoles), ctrl.remove);
  return r;
};

router.use(optionalAuthenticate);

// Progress
const progressRouter = require('express').Router();
crudRoutes(progressRouter, progressController, ALL, WRITE);
router.use('/progress', progressRouter);

// Contracts
const contractRouter = require('express').Router();
crudRoutes(contractRouter, contractController, ALL, WRITE);
router.use('/contracts', contractRouter);

// Milestones
const milestoneRouter = require('express').Router();
crudRoutes(milestoneRouter, milestoneController, ALL, WRITE);
router.use('/milestones', milestoneRouter);

// Deliverables
const deliverableRouter = require('express').Router();
crudRoutes(deliverableRouter, deliverableController, ALL, WRITE);
router.use('/deliverables', deliverableRouter);

// Financial
const financialRouter = require('express').Router();
crudRoutes(financialRouter, financialController, ALL, FIN);
router.use('/financials', financialRouter);

// Risks
const riskRouter = require('express').Router();
crudRoutes(riskRouter, riskController, ALL, WRITE);
router.use('/risks', riskRouter);

// Issues
const issueRouter = require('express').Router();
crudRoutes(issueRouter, issueController, ALL, WRITE);
router.use('/issues', issueRouter);

// Resources
const resourceRouter = require('express').Router();
crudRoutes(resourceRouter, resourceController, ALL, WRITE);
router.use('/resources', resourceRouter);

// Interventions
const interventionRouter = require('express').Router();
crudRoutes(interventionRouter, interventionController, ALL, ['ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER']);
router.use('/interventions', interventionRouter);

// Recovery Plans
const recoveryRouter = require('express').Router();
crudRoutes(recoveryRouter, recoveryController, ALL, WRITE);
router.use('/recovery', recoveryRouter);

// Forward Look
const forwardLookRouter = require('express').Router();
crudRoutes(forwardLookRouter, forwardLookController, ALL, WRITE);
router.use('/forward-look', forwardLookRouter);

// Users
const userRouter = require('express').Router();
userRouter.get('/',    userController.getAll);
userRouter.get('/:id', userController.getById);
userRouter.put('/:id', authorize(...ADMIN), userController.update);
userRouter.delete('/:id', authorize(...ADMIN), userController.remove);
router.use('/users', userRouter);

// Insurance
const insuranceRouter = require('express').Router();
crudRoutes(insuranceRouter, insuranceController, ALL, WRITE);
router.use('/insurances', insuranceRouter);

// SLAs
const slaRouter = require('express').Router();
crudRoutes(slaRouter, slaController, ALL, WRITE);
router.use('/slas', slaRouter);

// SLA Deliverables
const slaDeliverableRouter = require('express').Router();
crudRoutes(slaDeliverableRouter, slaDeliverableController, ALL, WRITE);
router.use('/sla-deliverables', slaDeliverableRouter);

// SLA Milestones
const slaMilestoneRouter = require('express').Router();
crudRoutes(slaMilestoneRouter, slaMilestoneController, ALL, WRITE);
router.use('/sla-milestones', slaMilestoneRouter);

module.exports = router;
