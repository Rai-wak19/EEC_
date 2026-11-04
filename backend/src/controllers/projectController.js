const projectService = require('../services/projectService');
const { makeController } = require('./controllerFactory');

module.exports = {
  getAll:   makeController((req) => projectService.getAll(req.query, req.user?.role)),
  getById:  makeController((req) => projectService.getById(req.params.id, req.user?.role)),
  create:   makeController((req) => projectService.create(req.body)),
  update:   makeController((req) => projectService.update(req.params.id, req.body)),
  remove:   makeController(async (req, res) => {
    await projectService.remove(req.params.id);
    res.json({ success: true, message: 'Project deleted.' });
  }),
};
