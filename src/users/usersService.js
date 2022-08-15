const User = require('./userModel');
const ApiException = require('../exceptions/ApiException');
const jwtService = require('../services/jwtService');
const validator = require('validator');
const exceptionCodes = require('../exceptions/validatorExceptionCodes');
const bcrypt = require('bcrypt');

async function getByEmail(email) {
  return await User.findOne({ where: { email: email } });
}

async function validateDto(createDto) {
  if (
    typeof createDto.email !== 'string' ||
    !validator.isEmail(createDto.email)
  ) {
    throw ApiException.BadRequest(['email'], exceptionCodes.notValid);
  }

  if (typeof createDto.name !== 'string') {
    throw ApiException.BadRequest(['name'], exceptionCodes.notValid);
  }

  if (
    typeof createDto.password !== 'string' ||
    !validator.isStrongPassword(createDto.password, { minLength: 7 })
  ) {
    throw ApiException.BadRequest(['password'], exceptionCodes.notStrong);
  }
}

async function create(createDto) {
  await validateDto(createDto);

  const user = await getByEmail(createDto.email);

  if (user) {
    throw ApiException.Conflict();
  }

  if (createDto.password !== createDto.confirmPassword) {
    throw ApiException.BadRequest(['confirmPassword'], exceptionCodes.notMatch);
  }

  const hash = await bcrypt.hash(createDto.password, 10);
  const createdUser = await User.create({
    ...createDto,
    password: hash
  });

  return jwtService.generateAccessToken({
    ...createdUser.get(),
    password: undefined
  });
}

module.exports = { create, getByEmail };
