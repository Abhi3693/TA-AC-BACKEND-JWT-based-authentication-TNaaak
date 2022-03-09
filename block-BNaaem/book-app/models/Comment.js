let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let commentSchema = new Schema({
  text:{type:String, required:true},
  author:{type:Schema.Types.ObjectId, ref:"User"},
  book:{type:Schema.Types.ObjectId, ref:"Book"},
}, {timestamps:true});


let Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;