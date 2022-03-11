let mongoose = require("mongoose");
let Schema = mongoose.Schema;


let commentSchema = new Schema({
  body: {type:String, required:true},
  author:{type:Schema.Types.ObjectId, ref:"User"},
  article:{type:Schema.Types.ObjectId, ref:"Article"},
}, {timestamps:true});


let Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;