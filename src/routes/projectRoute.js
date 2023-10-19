const express = require('express');
const projectController = require('../controllers/projectController.js');
const { checkAuth } = require('../middlewares/auth.js');

const router = express.Router();

router
    .route('/')
    .get(checkAuth, projectController.getProjects)
    .post(checkAuth, projectController.createProject);
router
    .route('/:id')
    .get(checkAuth, projectController.getProject)
    .put(checkAuth, projectController.updateProject)
    .delete(checkAuth, projectController.deleteProject);
router.post('/collaborators', checkAuth, projectController.searchCollaborator)
router.post('/collaborators/:id', checkAuth, projectController.addCollaborator);
router.post('/delete-collaborator/:id', checkAuth, projectController.deleteCollaborator);


module.exports = router;
