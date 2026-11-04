const router = require('express').Router();
const dc = require('../controllers/dashboardController');
const { optionalAuthenticate } = require('../middleware/auth');

router.use(optionalAuthenticate);
router.get('/overview',       dc.overview);
router.get('/project-status', dc.projectStatus);
router.get('/schedule',       dc.schedule);
router.get('/financial',      dc.financial);
router.get('/deliverables',   dc.deliverables);
router.get('/resources',      dc.resources);
router.get('/risks',          dc.risks);
router.get('/issues',         dc.issues);
router.get('/interventions',  dc.interventions);
router.get('/recovery',       dc.recovery);
router.get('/forward-look',   dc.forwardLook);

module.exports = router;
