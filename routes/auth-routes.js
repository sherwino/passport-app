const express   = require('express');
const bcrypt    = require('bcrypt');
const passport  = require('passport');
const User      = require('../models/user-model.js');
const ensure    = require('connect-ensure-login');

const authRoutes = express.Router();

// ROUTES GO HERE
authRoutes.get('/signup',
  //redirects to root if you Are Logged In
  ensure.ensureNotLoggedIn('/'),

  (req, res, next) => {

  // if (req.user) {
  //   res.redirect('/');
  //   return;
  // }
  res.render('auth/signup-view.ejs');
});


authRoutes.post('/signup', (req, res, next) => {
  const signName     = req.body.signupName;
  const signUsername = req.body.signupUsername;
  const signPassword = req.body.signupPassword;

//Don't let users submit blank usernames or passwords
  if (signUsername === '' || signPassword === '') {
    res.render('auth/signup-view.ejs', {
      errorMessage: 'Please provide both a username and a password sucka'
    });
    return;
  }

//IF YOU WANT TO CHECK PASSWORD LENGTH, CHARACTERS, ETC YOU WOULD DO IT HERE
  User.findOne(
    //first argument is the criteria which documents you want
    { username: signUsername },
    //second argument is the projection, which field you want to see
    { username: 1 },
    //third argument callback
    ( err, foundUser ) => {
    //see if the db query had an error
      if (err) {
        next(err);
        return;
      }
    //Don't let the user regiter if the username is taken
      if (foundUser) {
        res.render('auth/signup-view.ejs', {
          errorMessage: 'Username is taken, dude'
        });
        return;
      }
    //once you get to this point you should be able to save the user

    //encrypt the password that the user submitted
      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(signPassword, salt);

    //create the user
      const theUser = new User({
        name:               signName,
        username:           signUsername,
        encryptedPassword:  hashPass

      });
      //save the use to the db, unless if there is an error
      theUser.save((err) => {
        if (err) {
          next(err);
          return;
        }
        res.redirect('/');
      });
    }
  );
});

authRoutes.get('/login', (req, res, next) => {
  res.render('auth/login-view.ejs');

});

//<form method="post" actopm="/login">
authRoutes.post('/login',

//redirects to root if you Are Logged In
ensure.ensureNotLoggedIn('/'),

  passport.authenticate('local', { //using local as in 'LocalStrategy', { options }
  successRedirect: '/',      //instead of using regular express redirects we are using passport
  failureRedirect: '/login'
} )
);

authRoutes.get('/logout', (req, res, next) => {
  req.logout(); //this a passport method

  res.redirect('/');
});

module.exports = authRoutes;
