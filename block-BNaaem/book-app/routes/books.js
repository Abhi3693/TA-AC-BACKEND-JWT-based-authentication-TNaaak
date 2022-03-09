let express = require("express");
let router = express.Router();
let Book = require("../models/Book");
let User = require("../models/User");
let auth = require("../middlewares/auth");


// render all Books by auther/ name/ all
router.get("/", async (req,res,next) => {
  try {
    let books = await Book.find(req.query);
    return res.status(200).json({books});
  } catch (error) {
    return res.status(400).json(error);
  }
});

// render book by category
router.get("/findByCategory", (req,res,next) => {
  try {
    let books = Book.find({ category : {$in : req.query.category}});
    return res.status(200).json({books});
  } catch (error) {
    return res.status(400).json(error);
  }
});

// Create book
router.post("/createBook", async (req,res,next) => {
  try {
    req.body.author = req.user.id;
    let book = await Book.create(req.body);
    let userUpdate = await User.findByIdAndUpdate(req.user.id, { $push : { books: book.id }}, { new:true });
    if(book) {
      return res.status(200).json({book});
    } 
  } catch (error) {
    return res.status(400).json(error);
  }
});

// Render Single book details
router.get("/:id", (req,res,next) => {
  try {
    let book = Book.findById(req.params.id);
    if(book) {
      return res.status(200).json({book});
    } 
  } catch (error) {
    return res.status(400).json(error);
  }
})

// Edit book
router.put("/:id/edit", async (req,res,next) => {
  try {
    let book = await Book.findById(req.params.id);
    let authorId = String(book.author);
    let userId = String(req.user.id);
    if(authorId === userId) {
      let updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {new:true});
      return res.json({updatedBook});
    } else {
      return res.status(400).json({result: "Only author can edit book"});
    }
  } catch (error) {
    return res.json(error);
  }
});

// delete book
router.delete("/:id", auth.verifyUser ,async (req,res,next) => {
  try {
    let book = await Book.findByIdAndDelete(req.params.id);
    console.log(book);
    let user = User.findByIdAndUpdate(book.author, { $pull: { books: book._id }}, {new:true})
    return res.json({user})
  } catch (error) {
    return res.json(error);
  }
});



module.exports = router;