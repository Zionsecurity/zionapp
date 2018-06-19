var express             = require('express'),
    config              = require('./config'),
    path                = require('path'),
    mongoose            = require('mongoose'),
    pug                 = require('pug'),
    cors                = require('cors'),
    helmet              = require('helmet'),
    jwt                 = require('jsonwebtoken'),
    bodyParser          = require('body-parser'),
    passport            = require('passport'),
//    nev                 = require('email-verification')(mongoose),
    LocalStrategy       = require('passport-local').Strategy,
    BearerStrategy      = require('passport-http-bearer').Strategy,
    expressValidator    = require('express-validator'),
    User                = require('./models/user');


// importing routes
var local = require('./routes/local/index');
var public = require('./routes/public/index');


// create app object
var app = express();

// database
var mongo = config.mongodb

//TO DO:------------------------------------------------------------------------- 
//adapt to Azure here or revert to local MongoDB
//var mongoDB = `mongodb://${mongo.host}:${mongo.port}/${mongo.db}`;

const mongoenv = {
	dbName: 'zionapp',
	key: 'hdoVSceccloEdi9UWzfkCKtVddGE3OFpA0Nbcmb1MGmUMGodOTINFPe6XlsGmiUabCjhLeEjXvBobT7VbD3U2w==',
	port: '10255'
}

const mongoDB = 'mongodb://${mongoenv.dbName}:${mongoenv.key}@${mongoenv.dbName}.documents.azure.com:${mongoenv.port}/?ssl=true&replicaSet=globaldb'
//'mongodb://zionapp:hdoVSceccloEdi9UWzfkCKtVddGE3OFpA0Nbcmb1MGmUMGodOTINFPe6XlsGmiUabCjhLeEjXvBobT7VbD3U2w==@zionapp.documents.azure.com:10255/?ssl=true&replicaSet=globaldb'

var db = mongoose.connect(mongoDB, {useMongoClient: true}).connection;


var mongoDB = `mongodb://${mongo.host}:${mongo.port}/${mongo.db}`;
//END TO DO:-------------------------------------------------------------------------



db.on('error', () => console.error('Unable to connect to MongoDB'))
db.once('open', () => console.log('Connected to MongoDB'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// static stuff
app.use('/css', express.static(__dirname + '/css'));
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/uploads', express.static(__dirname + '/uploads'));


// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator({
    customValidators: {
        whitelist: (input, options) => input.every(v => options.includes(v))
    }
}));
app.use(passport.initialize());

// headers
app.use(helmet());


// CORS
const whitelist = [
'http://127.0.0.1:8080',
'http://localhost:8080',
'http://localhost:8000',
'http://192.168.1.37:8080',
'http://192.168.30.34:8080',
]
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  var origin = req.header('Origin');
  // Allow request without origin (mobile app) or whitelisted origin
  if (!origin || (whitelist.indexOf(origin) !== -1)) {
    corsOptions = { origin: true }
  } else{
    corsOptions = { origin: false }
  }
  callback(null, corsOptions)
}
app.use(cors(corsOptionsDelegate));
//app.use(cors({origin: '*'}));


// route handling
app.use('/', local)
app.use('/api', public)


// passport config
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
 }, User.authenticate()));
passport.use(new BearerStrategy(function(token, done) {
    jwt.verify(token, config.bearer.secret, function(err, decoded) {
        if (err) return done(null, {}, { auth: false });
        User.findById(decoded.id, function(err, user) {
            if (err) return done(null, {}, { auth: false });
            return done(null, user, { auth: true });
        })
    })
}))


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.redirect('/');
});



module.exports = app;