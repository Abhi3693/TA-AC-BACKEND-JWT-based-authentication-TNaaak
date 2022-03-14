let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let slugger = require('slugger');

let articleSchema = new Schema(
  {
    slug: { type: String },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    body: { type: String, required: true },
    tagList: [{ type: String }],
    favorited: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    favoritesCount: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

articleSchema.pre('save', async function (next) {
  if (this.title) {
    let title = this.title.toLowerCase();
    this.slug = await slugger(title);
  }
  next();
});

articleSchema.methods.articleJSON = function (loggedInUser) {
  let singleArticleJSON = {
    title: this.title,
    description: this.description,
    body: this.body,
    tagList: this.tagList,
    favoritesCount: this.favoritesCount,
    favorited: false,
    author: {
      name: this.author.username,
      bio: this.author.bio,
      image: this.author.image,
      following: false,
    },
  };

  if (this.favorited) {
    let findFav = this.favorited.find((fav) => {
      return fav.toString() == loggedInUser.id;
    });
    if (findFav) {
      singleArticleJSON.favorited = true;
    }
  }

  if (this.author.following) {
    let findFollow = this.author.following.find((foll) => {
      return foll.toString() == loggedInUser.id;
    });
    if (findFollow) {
      singleArticleJSON.author.following = true;
    }
  }

  return singleArticleJSON;
};

let Article = mongoose.model('Article', articleSchema);

module.exports = Article;
