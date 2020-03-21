const express = require('express');
const userController = require('../controllers/user-controller');
const pageController = require('../controllers/page-controller');

const router = express.Router();

router.post('/register', userController.registerUser);
router.get('/register/:registerToken', userController.validateRegistration);
router.get('/register', pageController.serveRegisterEmail);
router.post('/createUser', userController.createUser);

module.exports = router;