const express = require('express');
const usersRouter = require('./users/usersRouter');
const sessionsRouter = require('./sessions/sessionsRouter');

const mainRouter = express.Router();

mainRouter.use('/users', usersRouter);
mainRouter.use('/sessions', sessionsRouter);

module.exports = mainRouter;
