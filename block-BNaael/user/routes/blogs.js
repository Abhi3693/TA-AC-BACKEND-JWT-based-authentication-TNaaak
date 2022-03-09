let express = require("express");
let router = express.Router();

router.get("/", (req,res,next) => {
  res.status(200).json({user: "Login Successful"});
});

module.exports = router