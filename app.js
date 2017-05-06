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



mongoose.connect('mongodb://localhost/passport-app');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';
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
  secret: 'my cool passport app',
  //these two options are going to be used not to prevent warnings
  resave: true,
  saveUninitialized: true
}) );

//these need to come after the session middleware----as seen above ^^^^
app.use(passport.initialize());
app.use(passport.session());

//determines what to save in the session (called when you login)
passport.serializeUser((user, cb) => {
//cb is short for callback
  cb(null, user._id);
});


//where to get the rest of the users' information (called on every request after)
passport.deserializeUser((userId, cb) => {
//query the database with the ID from the box
  User.findById(userId, (err, theUser) =>{
    if (err) {
      cb(err);
      return;
    }
//sending the users info to the passport
    cb(null, theUser);
  });

});


const LocalStrategy = require('passport-local').Strategy;

const bcrypt = require('bcrypt');

passpost.use( new LocalStrategy (
  // 1st arg are just the options to customize the LocalStrategy
  { },
  //2nd argument is a callback for the lofic that validates the login
  (loginUsername, loginPassword, next) => {
    User.findOne(
      { username: loginUsername },
      (err, theUser ) => {
        // tell passport if there was an error
        if (err) {
          next(err);
          return;
        }
        // telling passport if there is no user with the given username
        if (!theUser) {
          //   the err argument in this case blank, and in the second arg fale means Log In Failed.
          //   we could customize the feedback messages
          next(null, false); //this is specific to passport, not express
          return;
        }

        //at this point the username is correct... so the next step is to check the password
        //bcrypt receives two arguments, the variable you are checking for and the original encryptedPassword
        if(!bcrypt.compareSync(loginPassword, theUser.encryptedPassword )) {
          // false in 2nd argument means log in Failed
          next(null, false);
          return;
        }
        //when we get to this point of the code....we have passed all of the validations
        //then we give passport the user's details, because there hasn't been an error
        next(null, theUser);
      }
    );
  }
) );

///----------------------------ROUTES HERE ---------------------------


const index = require('./routes/index');
app.use('/', index);

const myAuthRoutes = require('./routes/auth-routes.js');
app.use('/', myAuthRoutes);

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
