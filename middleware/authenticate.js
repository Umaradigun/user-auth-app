const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'Access token is missing or invalid',
    });
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'Unauthorized',
      message: 'Access token is invalid or expired',
    });
  }
};

module.exports = authenticateJWT;
