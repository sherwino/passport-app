const mongoose = require('mongoose');

// const User = require('./user-model.js');

const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    name:           { type: String },
    desc:           { type: String },
    photoAddress:   { type: String },
    //reference the id of the user
    owner:          { type: Schema.Types.ObjectId }

    // this is the way I would write it if I wanted to make the user a subdoc
    // owner:          { type: User.schema }
  },
  {
    timestamps: true
  }

);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
