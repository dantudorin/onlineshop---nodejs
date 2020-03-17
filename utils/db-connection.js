const Sequelize = require('sequelize');

const dbConnection = new Sequelize('register-login', 'root', 'tudorin', {
    host : 'localhost',
    dialect : 'mysql',
    port : 3306,
});

module.exports = dbConnection;