const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Regtoken = require('../models/Regtoken');
const emailSender = require('../utils/email-sender');
const Sequelize = require('sequelize');

exports.registerUser = async (req, res, next) => {
  
    try{
        let user = await User.findOne({
            where : {
                email : req.body.email
            }
        });
    
        if(user) {
           req.flash('message', 'An account with this email has been found! Please try another one.');
           req.flash('status', 400);
           return res.redirect('register');
        }
        
        let regToken = await Regtoken.findOne({
            where : {
                email : req.body.email
            }
        });
    
        if(regToken) {
            regToken = await regToken.update({
                token : jwt.sign({ foo: 'registration' }, 'secret')
            });
    
            let info = await emailSender.sendEmail(regToken.email, regToken.token, 'register-user');

            if(info !== 'success') {
                req.flash('message', 'Something went wrong with the server.');
                req.status('status', 500);
                return res.redirect('register');  
            } 
            console.log('A ajuns aici');
            return res.status(200).render('checkmailpage');
        }
    
        regToken = await Regtoken.create({
            email : req.body.email,
            token : jwt.sign({ foo: 'registration' }, 'secret')
        });
        let info = await emailSender.sendEmail(regToken.email, regToken.token, 'register-user');
        
        if(info !== 'success') {
            req.flash('message', 'Something went wrong with the server.');
            req.flash('status', 500);
            return res.status(500).redirect('register');
        } 
        console.log('A ajuns aici --> a creat tokenul pentru prima data');    
        return res.status(200).render('checkmailpage');
        
    } catch(error) {
        console.log(error);
        req.flash('message', 'Something went wrong with the server.');
        req.flash('status', 500);
        return res.redirect('register');
    }
};

exports.validateRegistration = async (req, res, next) => {
    
    try{
        let regToken = await Regtoken.findOne({
            where : {
                token : req.params.registerToken
            }
        });
    
        const expDate = new Date(regToken.updatedAt);
        expDate.setDate(expDate.getDate() + 1);
    
        if(expDate.getTime() >= Date.now()) {
            return res.status(200).render('fulfillregistration', {email : regToken.email, message : null});
        }
        req.flash('message', 'Register token has expired. Please register again.');
        req.flash('status', 400);
        return res.redirect('register');
    } catch(error) {
        console.log(error);
        req.flash('message', 'Something went wrong with the server');
        req.flash('status', 500);
        return res.redirect('register');
    }
    
};

exports.createUser = async (req, res, next) => {
    try{
        let user = await User.findOne({
            where : Sequelize.or(
                { email: req.body.email},
                { username: req.body.username }
              )
        });
    
        if(user) {
            req.flash('message', 'User already exists.');
            req.flash('status', 400);
            return res.redirect('login');
        }
    
        if(req.body.password !== req.body.confirmpassword) return res.status(400).render('fulfillregistration', {email : req.body.email, message : 'Passwords mismatched'}); 
        
        let saltRounds = 10;
        let encPass = await bcrypt.hash(req.body.password, saltRounds);
    
        user = await User.create({
            email : req.body.email,
            password : encPass,
            username : req.body.username
        });
    
        let regToken = await Regtoken.findOne({
            where : {
                email : user.email
            }
        });
    
        regToken.destroy();
    
        return res.redirect('login');
    
    }catch(error) {
        console.log(error);
        req.flash('message', 'Something went wrong with the server');
        req.flash('status', 500);
        return res.status(500).redirect('register');
    }
    
};

exports.login = async (req, res, next) => {
    try{
        let user = await User.findOne({
            where : Sequelize.or(
                { email: req.body.username},
                { username: req.body.username }
        )
        });

        if(!user) {
            req.flash('message', 'Invalid username.');
            req.flash('status', 400);
            return res.redirect('login');
        } 

        let matched = await bcrypt.compare(req.body.password, user.password);

        if(matched) {
            req.session.userId = user.id;
            return res.status(200).redirect('home');
        } else {
            req.flash('message', 'Invalid password.')
            req.flash('status', 400);
            return res.redirect('login');
        }

    } catch(error) {
        console.log(error);
        req.flash('message', 'Something went wrong with the server.');
        req.flash('status', 500);
        return res.status(500).redirect('login');
    }     
        
};

exports.logout = async (req, res, next) => {
   await req.session.destroy();
   res.status(200).redirect('home');
};

exports.getUserId = async (req, res, next) => {
     console.log(req.session.userId);
};