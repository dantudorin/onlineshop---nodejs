const Sequelize = require('sequelize');
const dbConnection = require('../utils/db-connection');

const Passwordtoken = dbConnection.define('password-tokens', {

    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true   
    },

   email : {
       type : Sequelize.STRING,
       allowNull : false,
       unique : true    
   },
   
   token : {
       type : Sequelize.STRING,
       allowNull : false,
       unique : true
   }

});

module.exports = Passwordtoken;