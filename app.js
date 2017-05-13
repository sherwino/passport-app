const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const layouts      = require('express-ejs-layouts');
const mongoose     = require('mongoose');
const session      = require('express-session');
const passport     = require('passport');
const User         = require('./models/user-model.js'); //
const flash        = require('connect-flash');

require('./config/passport-config.js');

mongoose.connect('mongodb://localhost/passport-app');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title = 'Playing with Passwords w/ passport-app';
//
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);
app.use(session({
  secret: 'dude app for passport',
  //these two options are going to be used not to prevent warnings
  resave: true,
  saveUninitialized: true
}) );

//these need to come after the session middleware----as seen above ^^^^

app.use(flash()); //need to use this after the session was created

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.user) {
    //creates a variable "user" FOR ALL THE VIEWS... yaaay
    res.locals.user = req.user;
  }
  next();
});




///----------------------------ROUTES HERE ---------------------------


const index = require('./routes/index');
app.use('/', index);

const myAuthRoutes = require('./routes/auth-routes.js');
app.use('/', myAuthRoutes);

const myUserRoutes = require('./routes/user-routes.js');
app.use('/', myUserRoutes);

const myRoomRoutes = require('./routes/room-routes.js');
app.use('/', myRoomRoutes);

///-------------------------ROUTES ABOVE ------------------------------

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
