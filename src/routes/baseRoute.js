const express = require('express');
const userRoutes = require('./userRoute');
const projectRoutes = require('./projectRoute');
const taskRoutes = require('./taskRoute');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;