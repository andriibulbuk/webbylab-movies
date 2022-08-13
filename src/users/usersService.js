const User = require('./userModel');
const ApiException = require('../exceptions/ApiException');
const jwtService = require('../services/jwtService');
const validator = require('validator');
const exceptionCodes = require('../exceptions/validatorExceptionCodes');
const bcrypt = require('bcrypt');

function normalizeUserData(user) {
  const { password, ...userData } = user;

  return userData;
}

async function getByEmail(email) {
  return await User.findOne({ where: { email: email } });
}

async function validateDto(createUserDto) {
  if (
    typeof createUserDto.email !== 'string' ||
    !validator.isEmail(createUserDto.email)
  ) {
    throw ApiException.BadRequest(['email'], exceptionCodes.notValid);
  }

  if (typeof createUserDto.name !== 'string') {
    throw ApiException.BadRequest(['name'], exceptionCodes.notValid);
  }

  if (
    typeof createUserDto.password !== 'string' ||
    !validator.isStrongPassword(createUserDto.password, { minLength: 7 })
  ) {
    throw ApiException.BadRequest(['password'], exceptionCodes.notStrong);
  }

  const user = await getByEmail(createUserDto.email);

  if (user) {
    throw ApiException.BadRequest(['email'], exceptionCodes.notUnique);
  }

  if (createUserDto.password !== createUserDto.confirmPassword) {
    throw ApiException.BadRequest(['confirmPassword'], exceptionCodes.notMatch);
  }
}

async function create(createUserDto) {
  await validateDto(createUserDto);

  const hash = await bcrypt.hash(createUserDto.password, 10);
  const { dataValues } = await User.create({
    ...createUserDto,
    password: hash
  });
  const normalizedUserData = normalizeUserData(dataValues);
  const accessToken = jwtService.generateAccessToken(normalizedUserData);

  return { status: 1, token: accessToken };
}

module.exports = { create, getByEmail, normalizeUserData };
