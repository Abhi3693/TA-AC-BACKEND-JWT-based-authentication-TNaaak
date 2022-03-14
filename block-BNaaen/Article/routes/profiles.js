var express = require('express');
var router = express.Router();
let User = require('../models/User');
let Article = require('../models/Article');
let Comment = require('../models/Comment');
var jwt = require('jsonwebtoken');
var auth = require('../middlewares/auth');

// get profile
router.get('/:username', auth.optionalUser, async (req, res, next) => {
  try {
    let user = await User.findOne({ username: req.params.username });
    let findProfile = await user.userProfile(req.user);
    return res.status(200).json({ profile: [findProfile] });
  } catch (error) {
    return res.status(401).json({ errors: [error] });
  }
});

router.use(auth.verifyUser);

// follow one of the user
router.post('/:username/follow', async (req, res, next) => {
  try {
    let followUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { $push: { followers: req.user.id } },
      { new: true }
    );
    let logedInUser = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { following: followUser.id } },
      { new: true }
    );
    let findProfile = await followUser.userProfile(req.user);
    return res.status(200).json({ profile: [findProfile] });
  } catch (error) {
    return res.status(401).json({ errors: [error] });
  }
});

// Unfollow one of the user
router.delete('/:username/follow', auth.verifyUser, async (req, res, next) => {
  try {
    let unfollowUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { $pull: { followers: req.user.id } },
      { new: true }
    );
    let logedInUser = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { following: unfollowUser.id } },
      { new: true }
    );
    let findProfile = await unfollowUser.userProfile(req.user);
    return res.status(200).json({ profile: [findProfile] });
  } catch (error) {
    return res.status(401).json({ errors: [error] });
  }
});

module.exports = router;
