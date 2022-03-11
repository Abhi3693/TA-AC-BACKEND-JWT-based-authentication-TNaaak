var express = require('express');
var router = express.Router();
let User = require("../models/User");
let Article = require("../models/Article");
let Comment = require("../models/Comment");
var jwt = require('jsonwebtoken');
var auth = require("../middlewares/auth");

/* GET users listing. */

// Get current user

router.get("/", auth.verifyUser , async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    let token = await user.signToken();
    res.json({user: await user.userJSON(token)});
  } catch (error) {
    return res.status(401).json({"errors":[error]});
  }
})

// register new user
router.post("/", async (req,res,next) => {
  try {
    let user = await User.create(req.body);
    let token = await user.signToken();
    res.json({user: await user.userJSON(token)});
  } catch (error) {
    return res.status(401).json({"errors":[error]});
  }
});


// login user
router.post("/login" ,async (req,res,next) => {
  let { email, password} = req.body;
  if(!email ) {
    res.status(422).json({"errors":["Email can't be empty"]});
  } else if(!password) {
    res.status(422).json({"errors":["Password can't be empty"]});
  } else if(!email && !password) {
    res.status(422).json({"errors":["Email/password can't be empty"]});
  }

  try {
    let user = await User.findOne({email});
    if(!user) {
      return res.status(422).json({"errors":["Email is not registered"]});
    }
    let result = await user.verifypassword(password);
    if(!result) {
      return res.status(422).json({"errors":["Password is incorrect"]});
    }
    let token = await user.signToken();
    res.json({user: await user.userJSON(token)});
  } catch (error) {
    return res.status(401).json({"errors":[error]});
  }
});


// Update user 

router.put("/:username", auth.verifyUser , async (req, res, next) => {
  try {
    let userTOEdit = await User.findOne({username:req.params.username});
    let userTOEditId = userTOEdit.id.toString();
  
    if(userTOEditId == req.user.id) {
      let user = await User.findByIdAndUpdate(userTOEdit._id, req.body, {new:true});
      res.json({user: await user.userJSON(null)});
    } else {
      res.status(400).json({"error":["Only Author can edit his profile"]});
    }
  } catch (error) {
    return res.status(401).json({"errors":[error]});
  }
})

module.exports = router;
