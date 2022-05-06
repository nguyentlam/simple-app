const express = require('express'),
  cors = require('cors'),
  path = require('path'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  MemoryStore = require('memorystore')(session),
  methodOverride = require('method-override'),
  logger = require('morgan'),
  errorhandler = require('errorhandler'),
  passport = require('passport');

const isProduction = process.env.NODE_ENV === 'production';
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride());
app.use(express.static(path.join(process.cwd(), 'public')));

const sessionStore = new MemoryStore({
  checkPeriod: 8 * 60 * 60 * 1000 // cleanup expired entries every 8h
});

app.use(session({
  secret: 'session-secret',
  store: sessionStore,
  cookie: { maxAge: 12 * 60 * 60 * 1000 }, //12h
  resave: false,
  saveUninitialized: false  
}));

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passport.js');

// middleware to make 'userinfo' available to all templates
app.use(function(req, res, next) {
  res.locals.userinfo = req.session.passport?.user;
  next();
});

if (!isProduction) {
  app.use(errorhandler());
};

app.use(require('./routes'));

app.use(function(req, res, next) {
  res.status(404).render('404');
});

module.exports = app;