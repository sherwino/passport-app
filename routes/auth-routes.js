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

        //before the redirect you could flash a message to the user using the flash package

        //store a message in the session/box to display after the redirect
        req.flash(
          //1 arg is a key of the message
          'success',
          //2nd argument is the actual message you want to display to the user
          'You have registered succesfully!'
        );

        res.redirect('/');
      });
    }
  );
});

authRoutes.get('/login', (req, res, next) => {
  res.render('auth/login-view.ejs', {
    errorMessage:   req.flash('error')
  });

});

//<form method="post" actopm="/login">
authRoutes.post('/login',

//redirects to root if you Are Logged In
ensure.ensureNotLoggedIn('/'),

  passport.authenticate('local', { //using local as in 'LocalStrategy', { options }
  successRedirect:    '/',      //instead of using regular express redirects we are using passport
  successFlash:       true,
  failureRedirect:    '/login',
  failureFlash:       true
} )
);

authRoutes.get('/logout', (req, res, next) => {
  req.logout(); //this a passport method
  req.flash('success', 'You have logged out successfully');
  res.redirect('/');
});

//-----------------FACEBOOK LOGIN ROUTES
// it is getting 'facebook' from.... FBStrategy
//the url could be called whatever you want
 authRoutes.get('/auth/facebook', passport.authenticate('facebook'));

//link to this address to log in with facebook
//where facebook goes after the user has accepted/rejected terms
// callbackURL: '/auth/facebook/callback'

 authRoutes.get('/auth/facebook/callback', passport.authenticate('facebook', {
   successRedirect:     '/',
   failureRedirect:     '/login'
   //here you could add the flash messagge
 }));

 authRoutes.get('/auth/google', passport.authenticate('google', {
   scope: [
     "https://www.googleapis.com/auth/plus.login",
     "https://www.googleapis.com/auth/plus.profile.emails.read"
  ]

 }));


 authRoutes.get('/auth/google/callback', passport.authenticate('google', {
   successRedirect:     '/',
   failureRedirect:     '/login'
   //here you could add the flash messagge
 }));

module.exports = authRoutes;
