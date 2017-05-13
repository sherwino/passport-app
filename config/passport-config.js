const User = require('../models/user-model.js');
const passport = require('passport');
const bcrypt = require('bcrypt');
const FbStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LocalStrategy = require('passport-local').Strategy;





// function passportSetup () {

//PASSPORT GOES THROUGH THE FOLLOWING:
// -- 1. Our Form
// == 2. LocalStrategy callback
// -- 3. if succesful --- passport.serializeUser()

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


// The same as:
// const passportLocal = require('passport-local');
// const LocalStrategy = passportLocal.Strategy;


passport.use( new FbStrategy(
{
  clientID:       '1245871508869582',
  clientSecret:   'f92575acc03787705ceae66193f095a7',
  callbackURL:    '/auth/facebook/callback'
},

(accessToken, refreshToken, profile, done) => { //address for a route in our app

  console.log('');
  console.log('FACEBOOK PROFILE ------->');
  console.log(profile);
  console.log('');

  User.findOne(
    { facebookID: profile.id },

    (err, foundUser) => {
        if (err) {
          done(err);
          return;
        }

        if (foundUser) { //this logs in the user
          done(null, foundUser);
          return;
        }

        //register the user if they are not registered
        const theUser = new User({
          facebookID:   profile.id,
          name:         profile.displayName
        });

        theUser.save((err) => {
          if (err) {
            done(err);
            return;
          }
          done(null, theUser);
        });
    }
  );

}
) );

passport.use (new GoogleStrategy(
  {

    clientID:         '357914593698-349mibd28tkd771qacecpo90g490csg2.apps.googleusercontent.com',
    clientSecret:     'UrX3NiersmgjoDntUx_dNfz_',
    callback:         '/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {

      console.log('');
      console.log('GOOGLE PROFILE ------->');
      console.log(profile);
      console.log('');

    User.findOne(
      { googleID:     profile.id },

      (err, foundUser) => {

      if (err) {
        done(err);
        return;
      }

      if (foundUser) {
        done(null, foundUser);
        return;
      }

      const theUser = new User({
        googleID:     profile.id,
        name:         profile.displayName
      });

      //if user doesn't have a name on profile, save the email as the name
      if (!theUser.name) {
        theUser.name = profile.emails[0].value;
      }
      theUser.save((err) => {
        if(err) {
          done(err);
          return;
        }
        done(null, theUser);
      });
  }
);

}

) );


passport.use( new LocalStrategy (
  // 1st arg are just the options to customize the LocalStrategy
  //LocalStrategy assumes that you loginforms are going to be named <input name="username" <input name="password"
  //if it doesn't match what the passport assumes you have to define the names of the inputs below
  {
    //the usernameField is a STD key from passport it has to always be named this way
    usernameField: 'loginUsername',  //<----you could only customize the string
    passwordField: 'loginPassword'
   },
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
          //   the err argument in this case is blank, and in the second arg fale means Log In Failed.
          //   we could customize the feedback messages
          next(null, false, { message: 'Wrong username! AAAAAAH!'}); //this is specific to passport, not express
          return;            //^^ this message is refering to req.flash('error')
        }

        //at this point the username is correct... so the next step is to check the password
        //bcrypt receives two arguments, the variable you are checking for and the original encryptedPassword
        if(!bcrypt.compareSync(loginPassword, theUser.encryptedPassword )) {
          // false in 2nd argument means log in Failed
          next(null, false, { message: 'You sure you remember your password'});
          return;
        }
        //when we get to this point of the code....we have passed all of the validations
        //then we give passport the user's details, because there hasn't been an error
        next(null, theUser, { message: `Welcome ${theUser.username}`});
              // this user goes ot passport.serializeUser
      });
    }
) );




// module.exports = passportSetup;
