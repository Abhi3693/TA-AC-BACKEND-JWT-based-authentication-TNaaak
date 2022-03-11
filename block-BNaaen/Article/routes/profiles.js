var express = require('express');
var router = express.Router();
let User = require("../models/User");
let Article = require("../models/Article");
let Comment = require("../models/Comment");
var jwt = require('jsonwebtoken');
var auth = require("../middlewares/auth");


router.use(auth.verifyUser);

// get profile
router.get("/:username", async (req, res, next) => {
  try {
    let user = await User.findOne({username: req.params.username});
    let findProfile = await user.userProfile(req.user);
    return res.status(200).json({"profile":[findProfile]});
  } catch (error) {
    return res.status(401).json({"errors":[error]});
  }
});

// follow one of the user
router.post("/:username/follow", auth.verifyUser ,async (req, res, next) => {
  try {
    let followUser = await User.findOneAndUpdate({username: req.params.username}, { $push: {followers: req.user.id}}, {new:true});
    console.log(followUser, "USER TO FOLLOW")
    let logedInUser = await User.findByIdAndUpdate(req.user.id, { $push: { following: followUser.id}}, {new:true});
    console.log(logedInUser,"logedIN USER");
    let findProfile = await followUser.userProfile(req.user);
    return res.status(200).json({"profile":[findProfile]});
  } catch (error) {
    return res.status(401).json({"errors":[error]});
  }
});

// Unfollow one of the user
router.delete("/:username/follow", auth.verifyUser ,async (req, res, next) => {
  try {
    let unfollowUser = await User.findOneAndUpdate({username: req.params.username}, { $pull: {followers: req.user.id}}, {new:true});
    let logedInUser = await User.findByIdAndUpdate(req.user.id, { $pull: { following: unfollowUser.id}}, {new:true});
    let findProfile = await unfollowUser.userProfile(req.user);
    return res.status(200).json({"profile":[findProfile]});
  } catch (error) {
    return res.status(401).json({"errors":[error]});
  }
});

module.exports = router;
