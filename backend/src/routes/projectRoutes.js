const router = require('express').Router();
const ctrl = require('../controllers/projectController');
const { optionalAuthenticate, authorize } = require('../middleware/auth');

const ALL_ROLES   = ['ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER', 'PROJECT_MANAGER', 'FINANCE', 'VIEWER'];
const WRITE_ROLES = ['ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER', 'PROJECT_MANAGER'];

router.use(optionalAuthenticate);
router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getById);
router.post('/',    authorize(...WRITE_ROLES), ctrl.create);
router.put('/:id',  authorize(...WRITE_ROLES), ctrl.update);
router.delete('/:id', authorize('ADMIN'),      ctrl.remove);

module.exports = router;
