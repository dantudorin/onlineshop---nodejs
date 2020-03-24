const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Regtoken = require('../models/Regtoken');
const emailSender = require('../utils/email-sender');
const Sequelize = require('sequelize');
const Passwordtoken = require('../models/Passwordtoken');

exports.registerUser = async (req, res, next) => {
  
    try{
        let user = await User.findOne({
            where : {
                email : req.body.email
            }
        });
        
        if(user) {
           req.flash('error', 'An account with this email has been found! Please try another one.');
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
                req.flash('error', 'Something went wrong with the server.');
                req.status('status', 500);
                return res.redirect('register');  
            }

            return res.status(200).render('checkmailpage');
        }
    
        regToken = await Regtoken.create({
            email : req.body.email,
            token : jwt.sign({ foo: 'registration' }, 'secret')
        });
        let info = await emailSender.sendEmail(regToken.email, regToken.token, 'register-user');
        
        if(info !== 'success') {
            req.flash('error', 'Something went wrong with the server.');
            req.flash('status', 500);
            return res.status(500).redirect('register');
        }

        return res.status(200).render('checkmailpage');
        
    } catch(error) {
        console.log(error);
        req.flash('error', 'Something went wrong with the server.');
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

        if(!regToken) {
            req.flash('error', 'Unable to proceed with registration! Please reconfirm email.')
            req.flash('status', 400);

            return res.redirect('register');
        }
    
        const expDate = new Date(regToken.updatedAt);
        expDate.setDate(expDate.getDate() + 1);
    
        if(expDate.getTime() >= Date.now()) {
            return res.status(200).render('fulfillregistration', {email : regToken.email, message : null});
        }
        
        req.flash('error', 'Register token has expired. Please register again.');
        req.flash('status', 400);
        
        return res.redirect('register');
    
    } catch(error) {
        console.log(error);
    
        req.flash('error', 'Something went wrong with the server');
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
            req.flash('error', 'User already exists.');
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
    
        regtoken = await regToken.destroy();
        
        req.flash('message', 'User was created.');
        req.flash('status', 200);

        return res.redirect('login');
    
    }catch(error) {
        console.log(error);
    
        req.flash('error', 'Something went wrong with the server');
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
            req.flash('error', 'Invalid username.');
            req.flash('status', 400);
            return res.redirect('login');
        } 

        let matched = await bcrypt.compare(req.body.password, user.password);

        if(matched) {
            req.session.userId = user.id;
            return res.status(200).redirect('home');
        } else {
            req.flash('error', 'Invalid password.')
            req.flash('status', 400);
            return res.redirect('login');
        }

    } catch(error) {
        console.log(error);
        req.flash('error', 'Something went wrong with the server.');
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

exports.forgotPassword = async (req, res, next) => {
    try{
        let user = await User.findOne({
            where : {
                email : req.body.email
            }
        });

        if(!user) {
            req.flash('error', 'User does not exist.');
            req.flash('status', 400);

            return res.redirect('register');
        }

        let passwordToken = await Passwordtoken.findOne({
            where : {
                email : req.body.email 
            }
        });

        if(passwordToken) {
            passwordToken = await passwordToken.update({
                token : jwt.sign({foo : 'forgot-password'}, 'secret')
            });

            await emailSender.sendEmail(passwordToken.email, passwordToken.token, 'reset-password');

            return res.redirect('reset-password');
        }

        passwordToken = await Passwordtoken.create({
            email : req.body.email,
            token : jwt.sign({foo : 'forgot-password'} , 'secret')
        });

        await emailSender.sendEmail(passwordToken.email, passwordToken.token, 'reset-password');
        
        return res.redirect('reset-password');
    
    } catch(error) {
        console.log(error);

        req.flash('error', 'Something went wrong with the server.');
        req.flash('status', 500);

        return res.redirect('login');
    }
        
};

exports.validateForgotPassword = async (req, res, next) => {

    try {
        let passwordToken = await Passwordtoken.findOne({
            where : {
                token : req.params.passwordToken
            }
        });
        
        if(!passwordToken) {
            req.flash('error', 'Unable to proceed with the password reset! Please re-enter email.');
            req.flash('status', 400);

            return res.redirect('reset-password');
        }

        let expDate = new Date(passwordToken.updatedAt);
        expDate = expDate.setDate(expDate.getDate() + 1);

        if(expDate.getTime() >= Date.now()) {
            return res.status(200).render('forgot-password', {email : passwordToken.email, message : null});
        }

        req.flash('error', 'Reset-password token has expired! Please resubmit request');
        req.flash('status', 400);

        return res.redirect('reset-password');

    } catch (error) {
        console.log(error);

        req.flash('error', 'Something went wrong with the server.');
        req.flash('status', 500);

        return res.redirect('reset-password');
    }
    
};

exports.updatePassword = async (req, res, next) => {

    let user = User.findOne({
        where : {
            email : req.body.email
        }
    });

    if(!user) {
        req.flash('error', 'User not found! Please register first.');
        req.flash('status', 400);

        return res.redirect('register');
    }

    if(req.body.password !== req.body.confirmPassword) {
      return req.status(400).render('forgot-password', {email : user.email, message : 'Passwords mismatched.'});
    }

    let saltRounds = 10;
    let encPass = await bcrypt.hash(req.body.password, saltRounds);

    user = await user.update({
        password : encPass
    });

    let passwordToken = await Passwordtoken.findOne({
        where : {
            email : req.body.email
        }
    });

    await passwordToken.destroy();

    req.flash('message', 'Password has been changed successfully!');
    req.flash('status', 200);

    return res.redirect('login');
};