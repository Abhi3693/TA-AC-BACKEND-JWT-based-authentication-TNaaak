var express = require('express');
var router = express.Router();
let auth = require("../middlewares/auth");
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/protected", auth.isUserLogged, (req,res,next) => {
  res.status(200).json({user: req.user});
});

module.exports = router;
