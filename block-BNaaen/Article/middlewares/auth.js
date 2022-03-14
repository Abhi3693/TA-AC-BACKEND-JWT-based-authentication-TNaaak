var jwt = require('jsonwebtoken');

module.exports = {
  verifyUser: async (req, res, next) => {
    let token = req.headers.authorization;
    try {
      let payLoad = await jwt.verify(token, process.env.SECRET);
      if (payLoad) {
        req.user = payLoad;
        next();
      } else {
        res.status(401).json({ error: ['token required'] });
      }
    } catch (error) {
      res.status(401).json({ error: [error] });
    }
  },
  optionalUser: async (req, res, next) => {
    let token = req.headers.authorization;
    if (token) {
      try {
        let payLoad = await jwt.verify(token, process.env.SECRET);
        if (payLoad) {
          req.user = payLoad;
          next();
        } else {
          res.status(401).json({ error: ['token required'] });
        }
      } catch (error) {
        res.status(401).json({ error: [error] });
      }
    } else {
      req.user = null;
      next();
    }
  },
};
