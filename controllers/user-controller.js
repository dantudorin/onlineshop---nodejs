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
                                            emailSender.sendEmail(req.body.email, regtoken.token);
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
                                    emailSender.sendEmail(req.body.email, regtoken.token);
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

exports.validateRegistration = (req, res, next) => {
    
    Regtoken.findOne({
        where : {
            token : req.params.registerToken
        }
    })
    .then(regtoken => {
        
        if(regtoken) {

            let date = new Date(regtoken.updatedAt);
            date.setDate(date.getDate() + 1);
            
            if(date.getTime() >= Date.now()) {
                //we render the page to fill other user information
                User.findOne({
                    where : {
                        id : regtoken.reguserId
                    }
                })
                .then(user => {
                    if(!user) {
                        res.status(400).render('register');
                    } else {
                        res.status(200).render('fulfillregistration', {email : user.email, message : ''});
                    }
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).send('Internal server error!');
                });
            } else {
                //Tokenul has expired and redirect to register page
                res.status(400).render('register');
            }
        } else {
            //User needs to register first to get a registerToken
            res.status(400).render('register');
        }
    })
    .catch(error => {
        console.log(error);
        res.status(500).send('Internal server error !');
    });
};

exports.createUser = (req, res, next) => {
    User.findOne({
        where : {
            email : req.body.email
        }
    })
    .then(user => {
        if(user) {
            if(req.body.password === req.body.confirmpassword) {
                const saltRounds = 10;
                bcrypt.hash(req.body.password, saltRounds)
                      .then(password => {
                          user.update({
                              password : password,
                              username : req.body.username
                          })
                          .then(user => {
                                user.getRegtoken()
                                    .then(regtoken => {
                                       regtoken.destroy();
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                          })
                          .catch(error => {
                              console.log(error);
                          })
                      })
                      .catch(error => {
                        res.status(500).render('fullfillregistration', {email : user.email, message : 'internal server error'});
                      });
                
            } else {
                res.status(400).render('fullfillregistration', {email : user.email, message : 'passwords mismatch'});
            }
        }
    })
}

exports.login = (req, res, next) => {
    
};