const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./utils/db-connection');
const registerRoute = require('./routes/register');
const authRoute = require('./routes/auth');
const User = require('./models/User');
const Regtoken = require('./models/Regtoken');

const application = express();

application.set('view engine', 'ejs');
application.set('views', 'views');


application.use(express.static(__dirname + '/public'));

application.use(bodyParser.urlencoded({extended : true}));
application.use(bodyParser.json());

application.use(registerRoute);
application.use(authRoute);

User.hasOne(Regtoken);

const serverPort = 3000;

sequelize.sync()
         .then(() => {
            application.listen(serverPort);
         })
         .catch(error => {
             console.log(error);
         })