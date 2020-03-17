const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Regtokens = require('../models/Regtokens');

exports.registerUser = (req, res, next) => {
  
    User.findOne({email : req.body.email})
        .then(user => {

            if(user) {
                
                console.log('Userul exista');
                user.getRegtokens()
                    .then(regtoken => {
                        console.log('Fac update la token');
            
                        regtoken.update({
                                    token :  jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256'})
                                })
                                .then(regtoken => {
                                        console.log('Am terminat de updatat tokenul');
                                })
                                .catch(error => {
                                        console.log(error);
                                });
                    })
                    .catch(error => {
                        console.log(error);
                    });

            } else {

                console.log('Userul nu exista');
                
                User.create({
                    email : req.body.email,
                    username : req.body.username,
                    password : req.body.password
                })
                .then(user => {
                    console.log('Am creat userul creez si tokenul');
        
                    user.setRegtokens({
                        token :  jwt.sign({ foo: 'bar' }, 'shhhhh')
                        })
                        .then(regtoken => {
                            console.log('Am creat si tokenul');
                        })
                        .catch(error => {
                            console.log(error);
                        });
                })
                .catch(error => {
                    console.log(error);
                });
            }
        })
        .catch(error => {
            console.log(error);
        });
};

exports.login = async (req, res, next) => {
    
};