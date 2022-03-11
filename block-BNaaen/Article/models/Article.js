let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let slugger = require("slugger");

let articleSchema = new Schema({
  slug: {type:String},
  title: {type:String, required:true, trim:true},
  description: {type:String, required:true},
  body: {type:String, required:true},
  tagList: [{type:String}],
  // favorited:[{type:Boolean, default:false}],
  favorited:[{type:Schema.Types.ObjectId, ref:"User"}],
  favoritesCount: {type:Number, default:0},
  author:{type:Schema.Types.ObjectId, ref:"User"},
  comments:[{type:Schema.Types.ObjectId, ref:"Comment"}],
}, {timestamps:true});


articleSchema.pre("save", async function (next) {
  if(this.title) {
    let title = this.title.toLowerCase();
    this.slug = await slugger(title);
  }
  next();
});

articleSchema.methods.articleJSON = async function () {
  return {
    title : this.title,
    description : this.description,
    body : this.body,
    tagList : this.tagList,
    comments : this.comments,
    favoritesCount: this.favoritesCount
  }
}

let Article = mongoose.model("Article", articleSchema);

module.exports = Article;