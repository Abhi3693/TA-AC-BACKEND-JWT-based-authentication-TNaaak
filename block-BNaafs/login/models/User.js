let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

let userSchema = new Schema({
  name:{type:String, required:true},
  email:{type:String, required:true,  unique:true},
  password:{type:String, required:true, minlength:3},
}, { timestamps:true });

userSchema.pre("save", async function(next) {
  if(this.password && this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10);
  } 
  next();
});

userSchema.methods.verifypassword = async function (password) {
  try {
    let result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
}

userSchema.methods.signToken = async function () {
  try {
    let payLoad = {userId : this.id, email: this.email}
    let token = await jwt.sign(payLoad, process.env.SECRET);
    return token;
  } catch (error) {
    return error
  }
}

userSchema.methods.userJSON = function (token) {
  return {
    id : this.name,
    email: this.email,
    token: token
  }
}

let User = mongoose.model("User", userSchema);

    module.exports = User;                                
                                    