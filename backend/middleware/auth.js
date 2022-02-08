const jwt = require('jsonwebtoken');
const config = require('../config/default.json');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');
  // Check if token is present
  if (!token) {
    return res.status(401).json( { msg: 'Token is missing, access denied' });
  }
  // Verify token
  try {
    const decodedToken = jwt.verify(token, config.jwtToken);
    req.user = decodedToken;
    next();
  } catch(err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};
