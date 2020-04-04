const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');

module.exports = async (req, res, next) => {

    if(req.session.isNotLoggedIn) {

        let cart = await Cart.findOne({
            where : { sessionId : req.session.sessionIdentifier }
        });

        if(!cart) {
            let cartToken = jwt.sign({ foo: 'unloggedSession' }, 'secretSession');
            req.session.sessionIdentifier = cartToken;
            
            await Cart.create({
                sessionId : cartToken
            });    
        }

        next();

    } else {

        let cartToken = jwt.sign({ foo: 'unloggedSession' }, 'secretSession');
        req.session.isNotLoggedIn = true;
        req.session.sessionIdentifier = cartToken;
    
        await Cart.create({
            sessionId : cartToken
        });

        next();
    }
}
