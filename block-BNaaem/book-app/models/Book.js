let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let bookSchema = new Schema({
 name:{type:String, required:true},
 price:{type:String, required:true},
 quantity:{type:String, required:true},
 category:[{type:String}],
 author:{type:Schema.Types.ObjectId, ref: "User"},
 comments:[{type:Schema.Types.ObjectId, ref: "cooment"}],
}, {timestamps:true});


let Book = mongoose.model("Book", bookSchema);

module.exports = Book;