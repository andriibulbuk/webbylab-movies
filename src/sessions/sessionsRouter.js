const express = require('express');
const { createSession } = require('./sessionsController');
const catchException = require('../utils/catchException');

const sessionsRouter = express.Router();

sessionsRouter.post('/', catchException(createSession));

module.exports = sessionsRouter;
