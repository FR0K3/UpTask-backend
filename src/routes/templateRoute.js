const express = require('express');
const templateController = require('../controllers/templateController.js');
const { checkAuth } = require('../middlewares/auth.js');

const router = express.Router();

router.post('/', checkAuth, templateController.addTemplate);
router
    .route('/:id')
    .get(checkAuth, templateController.getTemplate)
    .put(checkAuth, templateController.updateTemplate)
    .delete(checkAuth, templateController.deleteTemplate);

module.exports = router;