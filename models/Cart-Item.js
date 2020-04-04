const Sequelize = require('sequelize');
const sqlConnection = require('../utils/db-connection');

const CartItem = sqlConnection.define('chart-items', {
    id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        primaryKey : true,
        autoIncrement : true
    },

    quantity : {
        type : Sequelize.INTEGER,
        defaultValue : 1
    }
});

module.exports = CartItem;