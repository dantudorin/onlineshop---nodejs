const Cart = require('../models/Cart');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    if(req.session.userId) {
        next();
    } else {
        return res.status(400).redirect('login');
    }
}