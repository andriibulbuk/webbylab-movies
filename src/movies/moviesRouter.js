const express = require('express');
const {
  create,
  remove,
  update,
  getOne,
  getMany,
  setManyFromFile
} = require('./moviesController');
const authGuard = require('../middlewares/authMiddleware');
const catchException = require('../utils/catchException');

const moviesRouter = express.Router();

moviesRouter.post('/', catchException(authGuard), catchException(create));
moviesRouter.delete('/:id', catchException(authGuard), catchException(remove));
moviesRouter.patch('/:id', catchException(authGuard), catchException(update));
moviesRouter.get('/:id', catchException(authGuard), catchException(getOne));
moviesRouter.get('/', catchException(authGuard), catchException(getMany));
moviesRouter.post(
  '/import',
  catchException(authGuard),
  catchException(setManyFromFile)
);

module.exports = moviesRouter;
