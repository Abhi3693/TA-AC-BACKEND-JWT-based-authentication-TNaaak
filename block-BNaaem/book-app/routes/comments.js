let express = require("express");
let router = express.Router();
let Comment = require("../models/Comment");
let auth = require("../middlewares/auth");


// Create comment
router.post("/:id/addComment", async (req,res,next) => {
  try {
    req.body.author = req.user.id;
    req.body.book = req.params.id;
    let comment = await Comment.create(req.body);
    if(comment) {
      return res.status(200).json({comment});
    } 
  } catch (error) {
    return res.status(400).json(error);
  }
});

// Edit Comment
router.put("/:id/edit", async (req,res,next) => {
  try {
    let comment = await Comment.findById(req.params.id);
    let authorId = String(comment.author);
    let userId = String(req.user.id);
   
    if(authorId === userId) {
      let updatedComment = await Comment.findByIdAndUpdate(req.params.id, req.body, {new:true});
      return res.json({updatedComment});
    } else {
      return res.status(400).json({result: "Only author can edit comment"});
    }
  } catch (error) {
    return res.json(error);
  }
});

// delete comment
router.delete("/:id", auth.verifyUser ,async (req,res,next) => {
  try {
    let comment = await Comment.findByIdAndDelete(req.params.id);
    let book = Book.findByIdAndUpdate(comment.book, { $pull: { comments: comment._id }}, {new:true})
    return res.json({book})
  } catch (error) {
    return res.json(error);
  }
});

module.exports = router;