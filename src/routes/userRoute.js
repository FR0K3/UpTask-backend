const express = require('express');
const userController = require('../controllers/userController.js');
const { checkAuth } = require('../middlewares/auth.js');

const router = express.Router();

router.post('/', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/confirm/:token', userController.confirmUser);
router.post('/forget-password', userController.forgetPassword);
router.get('/forget-password/:token', userController.verifyToken);
router.post('/forget-password/:token', userController.resetPassword);
router.get('/profile', checkAuth, userController.getProfile);

module.exports = router;