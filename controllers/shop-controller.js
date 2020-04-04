const Product = require('../models/Product');
const path = require('path');
const Cart = require('../models/Cart');
const User = require('../models/User');
const CartItem = require('../models/Cart-Item');
const { Op } = require("sequelize");

exports.getHomePage = async (req, res, next) => {


    try {
        const products = await Product.findAll();
        
        if(products) return res.status(200).render('home', {path : '/home', products});
        
        return res.status(200).render('home', {path : '/home', products : null});

    } catch (error) {
        console.log(error);
    }
}

exports.getProductForm = (req, res, next) => {
    return res.status(200).render('addproduct', {path : '/add-product'});
}

exports.addProduct = async (req, res, next) => {
    try{
        const product = await Product.create({
            title : req.body.title,
            price : req.body.price,
            picture : req.file.path,
            description : req.body.description
        });

        return res.status(200).redirect('/');
    } catch(error) {
        console.log(error);
        res.redirect('error');
    }
}

exports.addToCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ where : {sessionId : req.session.sessionIdentifier}});
        let product = await Product.findOne({ where : {id : req.params.productId}});

        if(product && cart) {
            let cartItem = await CartItem.findOne( { where : {
                [Op.and]: [{ cartId : cart.id }, { productId : product.id }]
                }
            });

            if(cartItem) {
                await cartItem.update({
                    quantity : cartItem.quantity + 1
                });

                return res.status(200).redirect('/');
            } 

            await cart.addProduct(product);
            return res.status(200).redirect('/');

        } else {
            return res.status(400).redirect('/');
        }    
    } catch (error) {
        console.log(error);
        return res.status(500).redirect('error');
    }
    
}

exports.getChart = async (req, res, next) => {

    let cart = await Cart.findOne({ where : { sessionId : req.session.sessionIdentifier }});
    let products = await cart.getProducts();

    if(products) return res.status(200).send({products : products});

    return res.status(404).send('No products in cart');

}