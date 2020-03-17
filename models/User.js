const Sequelize = require('sequelize');
const dbConnection = require('../utils/db-connection');

const User = dbConnection.define('users', {

    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    },

    username : {
        type : Sequelize.STRING,
        allowNull  : false,
        unique : true
    },

    password : {
        type : Sequelize.STRING,
        allowNull : false
    },

    email : {
        type : Sequelize.STRING,
        allowNull : false,
        unique : true
    }
});

module.exports = User;