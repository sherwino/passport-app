const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
//fields/structure of the documents
  name: {
    type: String,
    required: [true, "You need to enter a name"]
  },

  username: {
    type: String,
    required: [true, "Please enter a username"]
  },

  encryptedPassword: {
    type: String,
    required: [true, "Please enter a password, now."]
  }
},
// 2nd arguments -> additional options
{

  timestamps: true // adds createdAt and updatedAt fields
}

);

const User = mongoose.model('User', userSchema);

module.exports = User;
