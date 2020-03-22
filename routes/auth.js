const express = require('express');
const userController = require('../controllers/user-controller');
const pageController = require('../controllers/page-controller');
const auth = require('../utils/auth');

const router = express.Router();

router.get('/login', pageController.serveLogin);
router.post('/login', userController.login);
router.get('/getUserId', auth, userController.getUserId);
router.get('/logout', userController.logout);

module.exports = router;