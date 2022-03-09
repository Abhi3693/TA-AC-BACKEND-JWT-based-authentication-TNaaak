var express = require('express');
var router = express.Router();
let User = require("../models/User");
var jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/register", async (req,res,next) => {
  try {
    let user = await User.create(req.body);
    var token = await user.signToken();
    return res.json({user: await user.userJSON(token)});
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req,res,next) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({error: "Email/password required"});
  }

  try {
    let user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({error: "Enter Registed Email"});
    }
    let result = user.verifypassword(password);
    if(!result) {
      return res.status(400).json({error: "Enter valid password"});
    }
    var token = await user.signToken();
    return res.json({user: await user.userJSON(token)});
  } catch (error) {
    next(error);
  }
}); 



module.exports = router;
