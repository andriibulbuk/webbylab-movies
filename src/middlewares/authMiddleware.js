const jwtService = require('../services/jwtService');
const ApiException = require('../exceptions/ApiException');
const exceptionCodes = require('../exceptions/validatorExceptionCodes');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw ApiException.Unauthorized(['token'], exceptionCodes.required);
  }

  const accessToken = authHeader.split(' ')[1];

  if (!accessToken) {
    throw ApiException.Unauthorized(['token'], exceptionCodes.required);
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiException.Unauthorized(['token'], exceptionCodes.notValid);
  }

  next();
}

module.exports = authMiddleware;
