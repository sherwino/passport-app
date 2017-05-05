const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user-model.js');

const authRoutes = express.Router();

// ROUTES GO HERE
authRoutes.get('/signup', (req, res, next) => {
  res.render('auth/signup-view.ejs');
});

authRoutes.post('/signup', (req, res, next) => {
  const signName     = req.body.signupName;
  const signUsername = req.body.singupUsername;
  const signPassword = req.body.signupPassword;

//Don't let users submit blank usernames or passwords
  if (signUsername === '' || signPassword === '') {
    res.render('auth/signup-view.ejs', {
      errorMessage: 'Please provide both a username and a password sucka'
    });
    return;
  }

//IF YOU WANT TO CHECK PASSWORD LENGTH, CHARACTERS, ETC YOU WOULD DO IT HERE
  User.findone(
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







module.exports = authRoutes;
