var jwt = require('jsonwebtoken');

module.exports = {
  isUserLogged : async (req,res,next) => {
    let token = req.headers.authorization;
    try { 
      if(token) {
        let payLoad = await jwt.verify(token, process.env.SECRET);
        req.user = payLoad;
        return next();
      } else {
        res.json({error: "token required"});
        return next();
      }
    } catch (error) {
      res.json({error});
      next();
    }
  }
}