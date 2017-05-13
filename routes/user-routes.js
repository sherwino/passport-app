const express = require('express');
const ensure = require('connect-ensure-login');
const bcrypt = require('bcrypt');

const User = require('../models/user-model');

const routerThingy = express.Router();

ensure.ensureLoggedIn();
ensure.ensureNotLoggedIn();

routerThingy.get('/profile/edit',
//redirects to /login if you are not logged in
ensure.ensureLoggedIn('/login'),

(req, res, next ) => {
  //if not for ensureLoggedIn() we would have to do this: below
  // if (!req.user) {
  //   res.reditect('/login');
  //   return;
  // }
  res.render('./user/edit-profile-view.ejs', {
    successMessage: req.flash('success')
    });
  }
);


routerThingy.post('/profile/edit',
  ensure.ensureLoggedIn('/login'),

  (req, res, next) => {

    const profileName         = req.body.profileName;
    const profileUsername     = req.body.profileUsername;
    const currentPassword     = req.body.profileCurrentPassword;
    const newPassword = req.body.profileNewPassword;

    User.findOne(
      {username: profileUsername },
      { username: 1 },
      ( err, foundUser ) => {
        if (err) {
          next(err);
          return;
        }

         // if there's a user with the username and it's not you
        if (foundUser && !foundUser._id.equals(req.user._id)) {
          res.render('user/edit-profile-view.ejs', {
            errorMessage: 'Username already taken.'
          });
          return;
        }

        // const profileChanges = {
        //   name: req.body.profileName,
        //   username: req.body.profileUsername
        // };

        //add updates from form
        req.user.name         = req.body.profileName;
        req.user.username     = req.body.profileUsername;


        //if both passwords are filled and the current password is correct
        if (currentPassword && newPassword && bcrypt.compareSync(currentPassword, req.usesr.enctryptedPassword)) {
          //then add the new encryptedPassword to the updates

          // if (bcrypt.compareSync(profileCurrentPassword, req.user.encryptedPassword)) {
            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(newPassword, salt);
          //profileChanges.encrypted Password = hashpass;
            req.user.enctryptedPassword = hashPass;
          }

          //save all the updates!
        req.user.save((err) => {
          if (err) {
            next(err);
            return;
          }

          req.flash('success', 'Changes saved');
          res.redirect('/profile/edit');
        });

//the less efficient way ------------------------
        // User.findByIdAndUpdate(
        //   req.user._id,
        //   {
        //     //what you want to update
        //     name:         req.body.profileName,
        //     username:     req.body.profileUsername,
        //   },
        //   (err, theUser) => {
        //     if (err) {
        //       next(err);
        //       return;
        //     }
        //     req.flash('success', 'Changes saved');
        //     res.redirect('/profile/edit');
        //   }
        // );
    }
  );
}
);

module.exports = routerThingy;
