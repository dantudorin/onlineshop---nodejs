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
        type : Sequelize.INTEGER,
        unique : true,
        allowNull : false
    }

});

module.exports = Cart;