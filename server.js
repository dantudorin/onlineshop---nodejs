const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./utils/db-connection');
const registerRoute = require('./routes/register');
const authRoute = require('./routes/auth');
const User = require('./models/User');
const Regtoken = require('./models/Regtoken');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');

const application = express();

let store = new MongoDbStore({
    uri : 'mongodb+srv://tudorindan:<password>@jwt-authentication-mc2ro.mongodb.net/test',
    collection : 'sessions'
});

store.on('error', function(error) {
    console.log(error);
});

application.set('view engine', 'ejs');
application.set('views', 'views');

application.use(session({
    secret : 'hidden encryption',
    resave : false,
    saveUninitialized : false,
    cookie : {
        secure : false,
        maxAge : 1000 * 60 * 60 * 24 * 5
    },
    store : store
}));

application.use(flash());

application.use(express.static(__dirname + '/public'));

application.use(bodyParser.urlencoded({extended : true}));
application.use(bodyParser.json());

application.use(registerRoute);
application.use(authRoute);

const serverPort = 3000;

sequelize.sync()
         .then(() => {
            application.listen(serverPort);
         })
         .catch(error => {
             console.log(error);
         })