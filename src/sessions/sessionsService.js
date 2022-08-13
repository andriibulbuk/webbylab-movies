const jwtService = require('../services/jwtService');
const usersService = require('../users/usersService');
const ApiException = require('../exceptions/ApiException');
const exceptionCodes = require('../exceptions/validatorExceptionCodes');
const bcrypt = require('bcrypt');
const validator = require('validator');

function validateDto(createSessionDto) {
  if (typeof createSessionDto.email !== 'string') {
    throw ApiException.BadRequest(['email'], exceptionCodes.notValid);
  }

  if (typeof createSessionDto.password !== 'string') {
    throw ApiException.BadRequest(['password'], exceptionCodes.notValid);
  }
}

async function create(createSessionDto) {
  validateDto(createSessionDto);
  const userData = await usersService.getByEmail(createSessionDto.email);

  if (!userData) {
    throw ApiException.BadRequest(
      ['email', 'password'],
      exceptionCodes.authFailed
    );
  }

  const isPassportValid = await bcrypt.compare(
    createSessionDto.password,
    userData.dataValues.password
  );

  if (!isPassportValid) {
    throw ApiException.BadRequest(
      ['email', 'password'],
      exceptionCodes.authFailed
    );
  }

  const normalizedUserData = await usersService.normalizeUserData(
    userData.dataValues
  );

  return {
    status: 1,
    token: jwtService.generateAccessToken(normalizedUserData)
  };
}

module.exports = { create };
