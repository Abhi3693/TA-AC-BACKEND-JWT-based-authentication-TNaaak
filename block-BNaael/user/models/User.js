let mongoose = require("mongoose");
const bcrypt = require('bcrypt');
let Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');

let userSchema = new Schema({
  name:{type:String, required:true},
  email:{type:String, required:true, unique:true},
  password:{type:String, required:true, minlength:3},
}, {timestamps:true});

userSchema.pre("save", async function (next) {
  if(this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.signToken = async function () {
  try {
    let payLoad = {id:this.id, email:this.email}
    let token = await jwt.sign(payLoad, process.env.SECRET);
    return token;
  } catch (error) {
    return error;
  } 
}

userSchema.methods.verifypassword = async function (password)  {
  try {
    let result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
}

userSchema.methods.userJSON = async function (token) {
  console.log(this.name)
  console.log(this.email)
  return {
    id : this.id,
    email : this.email,
    token : token
  }
}

let User = mongoose.model("User", userSchema);

module.exports = User;