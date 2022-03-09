var express = require('express');
var router = express.Router();
let User = require("../models/User");
let auth = require("../middlewares/auth")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/register", async (req,res,next) => {
  let { name,email,password } = req.body;
  if(!name || !email || !password) {
    return res.status(400).json({error: "validation error"});
  }

  try {
    let user = await User.create(req.body);
    let token = await user.signToken();
    return res.status(200).json({user: user.userJSON(token)});
  } catch (error) {
    res.status(400).json({error});
    return next(error);
  }
});

router.post("/login", async (req,res,next) => {
  let { email,password } = req.body;
  if( !email || !password ) {
    return res.status(400).json({error: "Email/password is required"});
  }

  try {
    let user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({error: "This email is not registerd"});
    }

    let token = await user.signToken();
    let result = await user.verifypassword(password);
    if(!result) {
      return res.status(400).json({error: "Enter valid password!"});
    }
    return res.status(200).json({user: user.userJSON(token)});
  } catch (error) {
    res.status(400).json({error});
    return next(error);
  }
});

router.get("/addCart", auth.verifyUser ,async (req,res,next) => {
  
  try {
    let user = await User.findByIdAndUpdate(req.user.id, { $push: { cart: req.query.book}}, {new:true});
    console.log(user)
    return res.status(200).json({user});
  } catch (error) {
    res.status(400).json({error});
    return next(error);
  }
})


router.get("/removeCart", auth.verifyUser ,async (req,res,next) => {
  
  try {
    let user = await User.findByIdAndUpdate(req.user.id, { $pull: { cart: req.query.book}}, {new:true});
    return res.status(200).json({user});
  } catch (error) {
    res.status(400).json({error});
    return next(error);
  }
})

module.exports = router;
