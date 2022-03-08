var express = require('express');
var router = express.Router();
let auth = require("../middleware/auth");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/dashboard", auth.isUserLogged,  (req,res, next)=> {
  res.json({"dashboard": "login successful"});
});

module.exports = router;
