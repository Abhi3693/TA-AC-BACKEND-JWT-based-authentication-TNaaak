let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

let userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 3 },
    image: { type: String },
    bio: { type: String },
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    articles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.verifypassword = async function (password) {
  let result = await bcrypt.compare(password, this.password);
  return result;
};

userSchema.methods.signToken = async function () {
  let payLoad = { id: this._id, email: this.email };
  let token = await jwt.sign(payLoad, process.env.SECRET);
  return token;
};

userSchema.methods.userJSON = function (token) {
  return {
    email: this.email,
    username: this.username,
    bio: this.bio,
    token: token,
    image: this.image,
  };
};

userSchema.methods.userProfile = async function (reqUser) {
  try {
    let profile = {
      username: this.username,
      bio: this.bio,
      image: this.image,
      following: false,
    };
    if (this.following && reqUser) {
      let isFollowing = this.following.find((follow) => {
        let strFollow = follow.toString();
        return strFollow === reqUser.id;
      });
      if (isFollowing) {
        profile.following = true;
        return profile;
      } else {
        return profile;
      }
    } else {
      return profile;
    }
  } catch (error) {
    return error;
  }
};

let User = mongoose.model('User', userSchema);

module.exports = User;
