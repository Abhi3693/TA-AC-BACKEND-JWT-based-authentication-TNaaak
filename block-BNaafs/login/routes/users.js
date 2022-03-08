var express = require('express');
var router = express.Router();
let User = require("../models/User");
var jwt = require('jsonwebtoken');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/register", async (req, res, next) => {
  try {
    let user = await User.create(req.body);
    let token = await user.signToken();
    return res.json({ user: await user.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req,res,next)=> {
  let { email, password } = req.body; 
  if(!email || !password) {
    return res.status(400).json({ error: "Email/password is Requird"});
  }
  try {
    let user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({ error: "This is not registed Email"});
    }
    let result = user.verifypassword(password);
    if(!result) {
      return res.status(400).json({ error: "Enter valid password"});
    } 
    // Generate Token
    let token = await user.signToken();
    res.json({ user: await user.userJSON(token) });
  } catch (error) {
    next(error);
  }
})

module.exports = router;