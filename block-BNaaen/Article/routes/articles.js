var express = require('express');
var router = express.Router();
let User = require("../models/User");
let Article = require("../models/Article");
let Comment = require("../models/Comment");
var jwt = require('jsonwebtoken');
var auth = require("../middlewares/auth");
let slugger = require("slugger");
const { TooManyRequests } = require('http-errors');

// Get all Articles or search by query
router.get("/", async (req, res, next) => {

  let limit = 20;
  if(req.query.limit) {
    limit = req.query.limit
  } 
  let offset = 0;
  if(req.query.offset) {
    offset = req.query.offset
  } 
  let query = req.query;
  try {
    // Req Query by username
    if(req.query.username) {
      let user = await User.findOne({username: req.query.username});
      query = {author: user.id };
    } 
    // Req Query by favorited
    if (req.query.favorited) {
      let user = await User.findOne({username: req.query.favorited});
      console.log(user);
      if(!user) {
        return res.status(401).json({"errors":["Article not found"]});
      } else {
        // Find article by favourite
        let articles = await Article.find({ favorited : {$in : [user.id]}}).populate("author").sort({ createdAt: -1 }).limit(limit).skip(offset);
        return res.json({articles});
      }
    } 
      // All Articles
      let articles = await Article.find(query).populate("author").sort({ createdAt: -1 }).limit(limit).skip(offset);
      return res.json({articles});
  } catch (error) {
    return res.status(401).json({"errors":["Article not found"]});
  }
});

// Get single Article
router.get("/:slug", async (req, res, next) => {
  try {
    let article = await Article.findOne({slug:req.params.slug}).populate("author");
    return res.json({article});
  } catch (error) {
    return res.status(401).json({"errors":["Article not found"]});
  }
});


router.use(auth.verifyUser);


// Add Article
router.post("/", async (req, res, next) => {
  try {
    req.body.author = req.user.id;
    req.body.tagList = req.body.tagList.trim().split(" ");
    let article = await Article.create(req.body);
    let user = await User.findByIdAndUpdate(req.user.id, { $push: { articles: article.id}}, {new:true});
    return res.json({article: await article.articleJSON()});
  } catch (error) {
    return res.status(401).json({"errors":["Article could not Creat"]});
  }
});

// Add comment 
router.post("/:slug/comment", async (req, res, next) => {
  try {
    let article = await Article.findOne({slug:req.params.slug});
    req.body.author = req.user.id;
    req.body.article = article.id;
    let comment = await Comment.create(req.body);
    article = await Article.findByIdAndUpdate(article.id, { $push : { comments: comment.id}}, {new:true}).populate("comments");
    return res.json({article});
  } catch (error) {
    return res.status(401).json({"errors":["Comment could not Creat"]});
  }
});

// Delete comment
router.delete("/:slug/comments/:id", async (req, res, next) => {
  try {
    let comment1 = await Comment.findById(req.params.id);
    let autherId = comment1.author.toString();
    if(autherId == req.user.id) {
      let comment = await Comment.findByIdAndDelete(req.params.id);
      let article = await Article.findByIdAndUpdate(comment.article, { $pull : { comments: comment.id}}, {new:true});
      return res.json({article});
    } else {
      return res.status(403).json({"errors":["Only Auther can Delete Comment"]});
    }
  } catch (error) {
    return res.status(401).json({"errors":["Comment could not Delete"]});
  }
});

// Update article
router.put("/:slug", async (req, res, next) => {
  try {
    let article1 = await Article.findOne({slug:req.params.slug});
    let autherId = article1.author.toString();
    if(req.user.id == autherId) {
      if(req.body.title) {
        req.body.slug = slugger(req.body.title);
      }
      let article = await Article.findByIdAndUpdate( article1.id , req.body, {new:true});
      return res.json({article: await article.articleJSON()});
    } else {
      return res.status(403).json({"errors":["Only Auther can edit Article"]});
    }
  } catch (error) {
    return res.status(401).json({"errors":["Article could not Update"]});
  }
});

// delete article
router.delete("/:slug", async (req, res, next) => {
  try {
    let article1 = await Article.findOne({slug:req.params.slug});
    let autherId = article1.author.toString();
    if(req.user.id == autherId) {
      let article = await Article.findByIdAndDelete(article1.id);
      return res.json({article: "Article deleted successfully"});
    } else {
      return res.status(403).json({"errors":["Only Auther can Delete Article"]});
    }
  } catch (error) {
    return res.status(401).json({"errors":["Article could not delete"]});
  }
});

// Add article in favourite
router.post("/:slug/favorite", async (req, res, next) => {
  try {
    let article = await Article.findOneAndUpdate({slug:req.params.slug}, { $push: { favorited: req.user.id}, $inc: { favoritesCount : 1}}, {new:true});
    let user = await User.findByIdAndUpdate(req.user.id, { $push: { favorites: article.id}}, {new:true});
    return res.json({article: await article.articleJSON()});
  } catch (error) {
    return res.status(401).json({"errors":["article not found"]});
  }
});

// remove article from favourite
router.delete("/:slug/favorite", async (req, res, next) => {
  try {
    let article = await Article.findOneAndUpdate({slug:req.params.slug}, { $pull: { favorited: req.user.id}, $inc: { favoritesCount : -1}}, {new:true});
    let user = await User.findByIdAndUpdate(req.user.id, { $pull: { favorites: article.id}}, {new:true});
    return res.json({article: await article.articleJSON()});
  } catch (error) {
    return res.status(401).json({"errors":["article not found"]});
  }
});




module.exports = router;


