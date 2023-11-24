const express = require('express');
const userRoutes = require('./userRoute');
const projectRoutes = require('./projectRoute');
const taskRoutes = require('./taskRoute');
const templateRoutes = require('./templateRoute');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/templates', templateRoutes);

module.exports = router;