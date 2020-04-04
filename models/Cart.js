const Sequelize = require('sequelize');
const sqlConnection = require('../utils/db-connection');

const Cart = sqlConnection.define('carts', {

    id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        autoIncrement : true,
        primaryKey : true
    },

    sessionId : {
        type : Sequelize.STRING,
        unique : true,
    }

});

module.exports = Cart;