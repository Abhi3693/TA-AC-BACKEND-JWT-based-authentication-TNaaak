let mongoose = require("mongoose");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');


let Schema = mongoose.Schema;

let userSchema = new Schema({
  name: {type:String, required:true},
  email: {type:String, required:true, unique:true},
  password: {type:String, required:true, minlength:3},
  books:[{type:Schema.Types.ObjectId, ref:"Book"}],
  cart:[{type:Schema.Types.ObjectId, ref:"Book"}],
}, {timestamps:true});

userSchema.pre("save", async function (next) {
  if(this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.verifypassword = async function (password) {
  let result = await bcrypt.compare(password, this.password);
  return result;
}

userSchema.methods.signToken = async function () {
  try {
    let payLoad = { id: this.id, email: this.email };
    let token = await jwt.sign(payLoad, process.env.SECRET)
    return token;
  } catch (error) {
    return error;
  }
}

userSchema.methods.userJSON =  function (token) {
  return {
    id : this.id,
    email : this.email,
    token:token
  }
}

let User = mongoose.model("User", userSchema);

module.exports = User;