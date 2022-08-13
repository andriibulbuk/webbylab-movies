const express = require('express');
const usersController = require('./usersController');
const catchException = require('../utils/catchException');

const usersRouter = express.Router();

usersRouter.post('/', catchException(usersController.create));

module.exports = usersRouter;
