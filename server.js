const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./utils/db-connection');
const registerRoute = require('./routes/register');
const authRoute = require('./routes/auth');
const User = require('./models/User');
const Regtokens = require('./models/Regtokens');

const application = express();

application.use(bodyParser.urlencoded({extended : true}));
application.use(bodyParser.json());

application.use(registerRoute);
application.use(authRoute);

const serverPort = 3000;

User.hasOne(Regtokens);

sequelize.sync()
         .then(() => {
            application.listen(serverPort);
         })
         .catch(error => {
             console.log(error);
         })