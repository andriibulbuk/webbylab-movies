const express = require('express');
const usersRouter = require('./users/usersRouter');
const sessionsRouter = require('./sessions/sessionsRouter');
const moviesRouter = require('./movies/moviesRouter');

const mainRouter = express.Router();

mainRouter.use('/users', usersRouter);
mainRouter.use('/sessions', sessionsRouter);
mainRouter.use('/movies', moviesRouter);

module.exports = mainRouter;
