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
const dotenv = require('dotenv').config();
const shopRoute = require('./routes/shop');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const CartItem = require('./models/Cart-Item');


const application = express();

let store = new MongoDbStore({
    uri : 'mongodb+srv://tudorindan:'  + process.env.DB_PASSWORD +  '@register-login-hugfj.mongodb.net/test?retryWrites=true&w=majority',
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
application.use('/uploads', express.static(__dirname + '/uploads'));

application.use(bodyParser.urlencoded({extended : true}));
application.use(bodyParser.json());

application.use(registerRoute);
application.use(authRoute);
application.use(shopRoute);

User.hasOne(Cart);
Cart.belongsToMany(Product, { through : CartItem});

const serverPort = 3000;

sequelize.sync()
         .then(() => {
            application.listen(serverPort);
         })
         .catch(error => {
             console.log(error);
         })