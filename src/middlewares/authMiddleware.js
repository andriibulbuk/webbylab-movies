const jwtService = require('../services/jwtService');
const ApiException = require('../exceptions/ApiException');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw ApiException.Unauthorized();
  }

  const accessToken = authHeader.split(' ')[1];

  if (!accessToken) {
    throw ApiException.Unauthorized();
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiException.Unauthorized();
  }

  next();
}

module.exports = authMiddleware;
