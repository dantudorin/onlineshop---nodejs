const express = require('express');
const userController = require('../controllers/user-controller');
const pageController = require('../controllers/page-controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/login', pageController.serveLogin);

router.post('/login', userController.login);

router.get('/getUserId', auth, userController.getUserId);

router.get('/logout', userController.logout);

router.get('/forgot-password', pageController.serveForgotPassword);

router.post('/forgot-password', userController.forgotPassword);

router.get('/forgot-password/:passwordToken', userController.validateForgotPassword);

router.post('/update-password', userController.updatePassword);

module.exports = router;