var express = require('express');
var router = express.Router();
let User = require('../models/User');
let Article = require('../models/Article');
let Comment = require('../models/Comment');
var jwt = require('jsonwebtoken');
var auth = require('../middlewares/auth');
let slugger = require('slugger');
const { TooManyRequests } = require('http-errors');

// Get all Articles or search by query
router.get('/', auth.optionalUser, async (req, res, next) => {
  let loggedUser = req.user;
  let limit = 20;
  let user;
  let author;
  if (req.query.limit) {
    limit = req.query.limit;
  }
  let offset = 0;
  if (req.query.offset) {
    offset = req.query.offset;
  }
  let query = req.query;
  try {
    // render article by taglist
    if (req.query.tagList && !req.query.author && !req.query.favorited) {
      query = { tagList: { $in: req.query.tagList } };
    }
    // Req Query by username
    if (req.query.author && !req.query.favorited && !req.query.tag) {
      author = await User.findOne({ username: req.query.author });
      query = { author: author.id };
    }
    // Req Query by favorited
    if (req.query.favorited && !req.query.author && !req.query.tag) {
      user = await User.findOne({ username: req.query.favorited });
      if (!user) {
        return res.status(401).json({ errors: ['Article not found'] });
      } else {
        // Find article by favourite
        query = { favorited: { $in: [user.id] } };
      }
    }
    // Find article by tag & favorite & author
    if (req.query.tagList && req.query.author && req.query.favorited) {
      author = await User.findOne({ username: req.query.author });
      user = await User.findOne({ username: req.query.favorited });
      query = {
        tagList: { $in: req.query.tagList },
        author: author.id,
        favorited: { $in: user.id },
      };
    }
    let articles = await Article.find(query)
      .populate('author')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    if (loggedUser) {
      let xyz = articles.map((arr) => {
        return arr.articleJSON(loggedUser);
      });

      return res.json({ articles: xyz });
    } else {
      let xyz = articles.map((arr) => {
        return arr.articleJSON(null);
      });
      return res.json({ articles: xyz });
    }
  } catch (error) {
    return res.status(401).json({ errors: ['Article not found'] });
  }
});

// Articles feed
router.get('/feed', auth.verifyUser, async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    let articles = await Article.find({ author: user.following }).populate(
      'author'
    );
    let xyz = articles.map((arr) => {
      return arr.articleJSON(req.user);
    });
    return res.json({ articles: xyz });
  } catch (error) {
    return res.status(401).json({ errors: ['Article not found'] });
  }
});

// Get single Article
router.get('/:slug', auth.optionalUser, async (req, res, next) => {
  try {
    let article = await Article.findOne({ slug: req.params.slug }).populate(
      'author'
    );

    if (req.user) {
      let result = await article.articleJSON(req.user);
      return res.json({ article: result });
    } else {
      let result = article.articleJSON(null);
      return res.json({ article: result });
    }
  } catch (error) {
    return res.status(401).json({ errors: ['Article not found'] });
  }
});

router.use(auth.verifyUser);

// Add Article
router.post('/', async (req, res, next) => {
  try {
    req.body.author = req.user.id;
    req.body.tagList = req.body.tagList.trim().split(' ');
    let article = await Article.create(req.body);
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { articles: article.id } },
      { new: true }
    );
    return res.json({ article: await article.articleJSON() });
  } catch (error) {
    return res.status(401).json({ errors: ['Article could not Creat'] });
  }
});

// Add comment
router.post('/:slug/comment', async (req, res, next) => {
  try {
    let article = await Article.findOne({ slug: req.params.slug });
    req.body.author = req.user.id;
    req.body.article = article.id;
    let comment = await Comment.create(req.body);
    article = await Article.findByIdAndUpdate(
      article.id,
      { $push: { comments: comment.id } },
      { new: true }
    ).populate('comments');
    return res.json({ article });
  } catch (error) {
    return res.status(401).json({ errors: ['Comment could not Creat'] });
  }
});

// Delete comment
router.delete('/:slug/comments/:id', async (req, res, next) => {
  try {
    let comment1 = await Comment.findById(req.params.id);
    let autherId = comment1.author.toString();
    if (autherId == req.user.id) {
      let comment = await Comment.findByIdAndDelete(req.params.id);
      let article = await Article.findByIdAndUpdate(
        comment.article,
        { $pull: { comments: comment.id } },
        { new: true }
      );
      return res.json({ article });
    } else {
      return res
        .status(403)
        .json({ errors: ['Only Auther can Delete Comment'] });
    }
  } catch (error) {
    return res.status(401).json({ errors: ['Comment could not Delete'] });
  }
});

// Update article
router.put('/:slug', async (req, res, next) => {
  try {
    let article1 = await Article.findOne({ slug: req.params.slug });
    let autherId = article1.author.toString();
    if (req.user.id == autherId) {
      if (req.body.title) {
        req.body.slug = slugger(req.body.title);
      }
      let article = await Article.findByIdAndUpdate(article1.id, req.body, {
        new: true,
      });
      return res.json({ article: await article.articleJSON() });
    } else {
      return res.status(403).json({ errors: ['Only Auther can edit Article'] });
    }
  } catch (error) {
    return res.status(401).json({ errors: ['Article could not Update'] });
  }
});

// delete article
router.delete('/:slug', async (req, res, next) => {
  try {
    let article1 = await Article.findOne({ slug: req.params.slug });
    let autherId = article1.author.toString();
    if (req.user.id == autherId) {
      let article = await Article.findByIdAndDelete(article1.id);
      return res.json({ article: 'Article deleted successfully' });
    } else {
      return res
        .status(403)
        .json({ errors: ['Only Auther can Delete Article'] });
    }
  } catch (error) {
    return res.status(401).json({ errors: ['Article could not delete'] });
  }
});

// Add article in favourite
router.post('/:slug/favorite', async (req, res, next) => {
  try {
    let article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $push: { favorited: req.user.id }, $inc: { favoritesCount: 1 } },
      { new: true }
    );
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { favorites: article.id } },
      { new: true }
    );
    return res.json({ article: await article.articleJSON(req.user) });
  } catch (error) {
    return res.status(401).json({ errors: ['article not found'] });
  }
});

// remove article from favourite
router.delete('/:slug/favorite', async (req, res, next) => {
  try {
    let article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $pull: { favorited: req.user.id }, $inc: { favoritesCount: -1 } },
      { new: true }
    );
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: article.id } },
      { new: true }
    );
    return res.json({ article: await article.articleJSON() });
  } catch (error) {
    return res.status(401).json({ errors: ['article not found'] });
  }
});

module.exports = router;
