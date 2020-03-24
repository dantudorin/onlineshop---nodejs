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

            return res.redirect('http://localhost:3000/register');
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
        
        let regToken = await Regtoken.findOne({
            where : {
                email : req.body.email
            }
        });

        if(!regToken) {
            req.flash('error', 'It seems like you don\'t have a register token. Please create one.');
            req.flash('status', 400);

            return res.redirect('register');
        } 

        if(req.body.password !== req.body.confirmpassword) return res.status(400).render('fulfillregistration', {email : req.body.email, message : 'Passwords mismatched'}); 

        await regToken.destroy();
        
        let saltRounds = 10;
        let encPass = await bcrypt.hash(req.body.password, saltRounds);
    
        user = await User.create({
            email : req.body.email,
            password : encPass,
            username : req.body.username
        });
            
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

        let info;

        if(passwordToken) {
            passwordToken = await passwordToken.update({
                token : jwt.sign({foo : 'secret-password'}, 'secret')
            });

           info =  await emailSender.sendEmail(passwordToken.email, passwordToken.token, 'reset-password');
           console.log(info);
           if(info !== 'success') {
            
            req.flash('error', 'Something went wrong with the server.');
            req.flash('status', 500);
            
            return res.redirect('forgot-password');
           }

            return res.status(200).render('checkmailpage');
        }

        passwordToken = await Passwordtoken.create({
            email : req.body.email,
            token : jwt.sign({foo : 'secret-password'} , 'secret')
        });

        info = await emailSender.sendEmail(passwordToken.email, passwordToken.token, 'reset-password');
        
        if(info !== 'success') {
            
            req.flash('error', 'Something went wrong with the server.');
            req.flash('status', 500);

            return res.redirect('forgot-password');
        }

        return res.status(200).render('checkmailpage');
    
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
            req.flash('error', 'Invalid token. Please resend email.');
            req.flash('status', 400);

            return res.redirect('http://localhost:3000/forgot-password');
        }

        const expDate = new Date(passwordToken.updatedAt);
        expDate.setDate(expDate.getDate() + 1);

        if(expDate.getTime() >= Date.now()) {
            return res.status(200).render('reset-password-form', {email : passwordToken.email, error : null});
        }

        req.flash('error', 'Reset-password token has expired! Please resubmit request');
        req.flash('status', 400);

        return res.redirect('forgot-password');

    } catch (error) {
        console.log(error);

        req.flash('error', 'Something went wrong with the server.');
        req.flash('status', 500);

        return res.redirect('forgot-password');
    }
    
};

exports.updatePassword = async (req, res, next) => {

    try{

        let user = await User.findOne({
            where : {
                email : req.body.email
            }
        });

        if(!user) {
            req.flash('error', 'User not found! Please register.');
            req.flash('status', 400);

            return res.redirect('login');
        }

        let passwordToken = await Passwordtoken.findOne({
            email : req.body.email
        });

        if(!passwordToken) {
            req.flash('error', 'Could not found reset-password token.');
            req.flash('status', 400);

            return res.redirect('forgot-password');
        }

        if(req.body.password !== req.body.confirmpassword) return res.status(400).render('reset-password-form', {error : 'Password mismatched.'}); 

        passwordToken = await passwordToken.destroy();

        req.flash('message', 'Password has been changed.');
        req.flash('status', 200);

        return res.redirect('login');

    } catch(error) {
        console.log(error);

        req.flash('error', 'Something went wrong with the server');
        req.flash('status', 'Something went wrong with the server');

        return res.redirect('forgot-password');
    }

};