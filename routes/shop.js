const express = require('express');
const shopController = require('../controllers/shop-controller');
const router = express();

router.get('/', shopController.getHomePage);

module.exports = router;