const express = require('express');
const taskController = require('../controllers/taskController.js');
const { checkAuth } = require('../middlewares/auth.js');

const router = express.Router();

router.post('/', checkAuth, taskController.addTask);
router
    .route('/:id')
    .get(checkAuth, taskController.getTask)
    .put(checkAuth, taskController.updateTask)
    .delete(checkAuth, taskController.deleteTask);
router.post('/status/:id', checkAuth, taskController.changeStatus);

module.exports = router;