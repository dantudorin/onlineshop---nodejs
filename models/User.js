const Sequelize = require('sequelize');
const dbConnection = require('../utils/db-connection');
const Regtokens = require('./Regtoken');

const User = dbConnection.define('regusers', {

    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    },

    username : {
        type : Sequelize.STRING,
        allowNull  : true,
        unique : true
    },

    password : {
        type : Sequelize.STRING,
        allowNull : true
    },

    email : {
        type : Sequelize.STRING,
        allowNull : false,
        unique : true
    }
});
module.exports = User;



