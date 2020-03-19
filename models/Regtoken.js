const Sequelize = require('sequelize');
const dbConnection = require('../utils/db-connection');

const Regtoken = dbConnection.define('regtokens', {

    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    },

    token : {
        type : Sequelize.STRING,
        allowNull : false
    },
});

module.exports = Regtoken;