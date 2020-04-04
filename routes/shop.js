const express = require('express');
const shopController = require('../controllers/shop-controller');
const router = express();
const multer = require('multer');
const unLoggedSession = require('../middleware/unLoggedSession');

const storage = multer.diskStorage({
    destination : function (req, file, cb) {
        cb(null, 'uploads/');
    },

    filename : function (req, file, cb) {
        cb(null, file.originalname);
    }

});
var upload = multer({storage : storage});



router.get('/', unLoggedSession, shopController.getHomePage);
router.get('/add-product', shopController.getProductForm);
router.post('/add-product', upload.single('prodImage'), shopController.addProduct);
router.get('/add-tocart/:productId', unLoggedSession, shopController.addToCart);
router.get('/cart', shopController.getChart);

router.get('/500', (req, res, next) => {
    return res.render('error');
})

module.exports = router;