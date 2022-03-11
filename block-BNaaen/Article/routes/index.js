var express = require('express');
const Article = require('../models/Article');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// get all tags
router.get("/tags", async (req, res, next) => {
  try {
    let tags = await Article.distinct("tagList")
    return res.status(200).json({tags:tags});
  } catch (error) {
    return res.status(401).json({"errors":[error]});
  }
});

module.exports = router;
