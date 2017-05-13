const express   = require('express');
const ensure    = require('connect-ensure-login');
const router    = express.Router();
const multer    = require('multer');
const path      = require('path');

const Room      = require('../models/room-model.js');

//no need to get the id in the url/form because you have that info in the session
router.get('/rooms/new',
//we need to be logged in to create rooms
  ensure.ensureLoggedIn('/login'),

  (req, res, next) => {
    res.render('rooms/new-room-view.ejs');

});
// you should use s3 for production
const myUploader = multer ({ dest: path.join(__dirname, '../public/uploads') });

router.post('/rooms',
  ensure.ensureLoggedIn('/login'),

  //<input type="file name ="roomPhoto">
                      //  |
  myUploader.single('roomPhoto'),

  (req, res, next) => {

    console.log('FILE UPLOAD ------');
    console.log(req.file);

    const theRoom = new Room ({
      name:           req.body.roomName,
      desc:           req.body.roomDescription,
      photoAddress:   `/uploads/${req.file.filename}`,
      owner:          req.user._id

    });

    theRoom.save((err) => {
      if (err) {
        next(err);
        return;
      }

      req.flash('success', 'Your room was saved succesfully');

      res.redirect('/rooms');
    });
  }
);


router.get('/rooms',
  ensure.ensureLoggedIn(),

  (req, res, next ) => {
    Room.find(
    { owner:    req.user._id },
    (err, roomsList) => {
      if (err) {
        next(err);
        return;
      }
      res.render('rooms/rooms-list-view.ejs', {
        rooms:              roomsList,
        successMessage:     req.flash('success')
      });
    }
  );
  }
);

module.exports = router;
