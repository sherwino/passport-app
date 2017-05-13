const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
//fields/structure of the documents
//----ALL USERS
  name: {
    type: String,
    required: [true, "You need to enter a name"]
  },

//----------TRADITIONAL REGISTRATION USERS
  username: {
    type: String,
    // required: [true, "Please enter a username"]  <---- CANT USE WITH TOKENS
  },

  encryptedPassword: {
    type: String,
    // required: [true, "Please enter a password, now."] <---- CANT USE WITH TOKENS
  },
//----------TRADITIONAL FACEBOOK USERS
  facebookID: { type: String },
//----------TRADITIONAL FACEBOOK USERS
  googleID: { type: String },

},
// 2nd arguments -> additional options
{

  timestamps: true // adds createdAt and updatedAt fields
}

);

const User = mongoose.model('User', userSchema);

module.exports = User;
