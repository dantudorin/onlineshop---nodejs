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
           return res.status(400).render('register', {message : 'User already exists'});
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
    
            let info = await emailSender.sendEmail(regToken.email, regToken.token);

            if(info !== 'success')  return res.status(500).render('register', {message : 'Email service is down! Try again later.'});

            return res.status(200).render('checkmailpage');
        }
    
        regToken = await Regtoken.create({
            email : req.body.email,
            token : jwt.sign({ foo: 'registration' }, 'secret')
        });
        let info = await emailSender.sendEmail(regToken.email, regToken.token);
        
        if(info !== 'success') return res.status(500).render('register', {message : 'Email service is down! Try again later.'});

        return res.status(200).render('checkmailpage');
        
    } catch(error) {
        console.log(error);
        return res.status(500).render('register', {message : 'Something went wrong with the server.'});
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
    
        return res.status(400).render('register', {message : 'You registration token has expired! Please reenter your email address to generate new one'});
    } catch(error) {
        console.log(error);
        return res.status(500).render('register' , {message : 'Something went wrong with the server.'});
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
        console.log('A facut asta');
        if(user) return res.status(400).render('login', {message : 'User exists'});
    
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
    
        return res.status(200).render('login', {message : null});
    
    }catch(error) {
        console.log(error);
        return res.status(500).render('register', {message : 'Something went wrong with the server'});
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

        if(!user) return res.status(400).render('login', { message : 'User not found'});

        let matched = await bcrypt.compare(req.body.password, user.password);

        if(matched) {
            req.session.userId = user.id;
            return res.status(200).redirect('home');
        } else {
            return res.status(400).render('login', {message : 'Incorrect password'});
        }

    } catch(error) {
        console.log(error);
        return res.status(500).render('login', {message : 'Something went wrong with the server'});
    }     
        
};

exports.logout = async (req, res, next) => {
   await req.session.destroy();
   res.status(200).redirect('home');
};

exports.getUserId = async (req, res, next) => {
     console.log(req.session.userId);
};