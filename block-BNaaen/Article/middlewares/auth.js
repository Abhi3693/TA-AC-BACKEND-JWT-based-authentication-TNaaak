var jwt = require('jsonwebtoken');

module.exports = {
  verifyUser : async (req, res, next) => {
    let token = req.headers.authorization;
    try {
      let payLoad = await jwt.verify(token, process.env.SECRET);
      if(payLoad) {
        req.user = payLoad;
        next();
      } else {
        res.status(400).json({error: ["token required"]});
      }
    } catch (error) {
      res.status(400).json({error: [error]});
      next();
    }
    
  }
}