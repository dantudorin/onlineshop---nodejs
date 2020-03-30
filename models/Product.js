const Sequelize = require('sequelize');
const sqlConnection = require('../utils/db-connection');

const Product = sqlConnection.define('products', {

    id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        autoIncrement : true,
        primaryKey : true
    },

    title : {
        type : Sequelize.STRING
    },

    description : {
        type : Sequelize.STRING
    },

    price : {
        type : Sequelize.FLOAT
    },

    picture : {
        type : Sequelize.STRING
    }

});

module.exports = Product;