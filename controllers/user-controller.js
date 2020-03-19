const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Regtoken = require('../models/Regtoken');
const emailSender = require('../utils/email-sender');

exports.registerUser = (req, res, next) => {
  
    User.findOne({
            where : {
                email : req.body.email        
            }
        })
        .then(user => {
            console.log(req.body.email);
            if(!user) {
                User.create({email : req.body.email, username : req.body.username, password : req.body.password})
                    .then(user => {
                        Regtoken.create({token : jwt.sign({ foo: 'registration' }, 'private')})
                                .then(regtoken => {
                                    user.setRegtoken(regtoken)
                                        .then(payload => {
                                            emailSender.sendEmail(req.body.email);
                                            res.status(200).send('Email was send! Please check your mailbox and cofirm registration!');
                                        })
                                        .catch(error => {
                                            console.log(error);
                                        })
                                })
                                .catch(error => {
                                    console.log(error);
                                })
                    })
                    .catch(error => {
                        console.log(error);
                    });
        
            } else {

                user.getRegtoken()
                    .then(regtoken => {
                        regtoken.update({token : jwt.sign({ foo: 'registration' }, 'private')})
                                .then(regtoken => {
                                    emailSender.sendEmail(req.body.email);
                                    res.status(200).send('Confirmation email was resend');
                                })
                                .catch(error => {
                                    console.log(error);
                                });
                    })
                    .catch(error => {
                        console.log(error);
                    })

            }

        })
        .catch(error => {
            console.log(error);
        })

};

exports.login = async (req, res, next) => {
    
};