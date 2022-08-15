const { Movie, Actor } = require('./movieModel');
const { Op } = require('sequelize');
const ApiException = require('../exceptions/ApiException');
const exceptionCodes = require('../exceptions/validatorExceptionCodes');

function validateTitle(title) {
  if (typeof title !== 'string') {
    throw ApiException.BadRequest(['title'], exceptionCodes.notValid);
  }
}

function validateYear(year) {
  const FIRST_MOVIE_YEAR = 1888;
  const MAX_AVAILABLE_YEAR = 2050;

  if (
    typeof year !== 'number' ||
    year < FIRST_MOVIE_YEAR ||
    year > MAX_AVAILABLE_YEAR
  ) {
    throw ApiException.BadRequest(['year'], exceptionCodes.notValid);
  }
}

function validateFormat(format) {
  if (typeof format !== 'string') {
    throw ApiException.BadRequest(['format'], exceptionCodes.notValid);
  }
}

function validateActors(actors) {
  if (!Array.isArray(actors)) {
    throw ApiException.BadRequest(['actors'], exceptionCodes.notValid);
  }

  const unexpectedActors = actors.filter((actor) => typeof actor !== 'string');

  if (unexpectedActors.length) {
    throw ApiException.BadRequest(['actors'], exceptionCodes.notValid);
  }
}

function validateCreateDto({ title, year, format, actors }) {
  validateTitle(title);
  validateYear(year);
  validateFormat(format);
  validateActors(actors);
}

function validateUpdateDto({ title, year, format, actors }) {
  if (!title && !year && !format && !actors) {
    throw ApiException.BadRequest([], exceptionCodes.notValid);
  }

  if (title) {
    validateTitle(title);
  }

  if (year) {
    validateYear(year);
  }

  if (format) {
    validateFormat(format);
  }

  if (actors) {
    validateActors(actors);
  }
}

function parseOne(movie) {
  const [title, year, format, actors] = movie.split('\n');

  return { title, year: +year, format, actors: actors.split(', ') };
}

function parseMany(data) {
  return data
    .replace(/Title: /g, '')
    .replace(/Release Year: /g, '')
    .replace(/Format: /g, '')
    .replace(/Stars: /g, '')
    .trim()
    .split('\n\n')
    .map((movie) => parseOne(movie));
}

async function getActors(actorNames) {
  const normalizedActors = actorNames.map((name) => ({ name }));

  await Actor.bulkCreate(normalizedActors, {
    ignoreDuplicates: true
  });

  return await Actor.findAll({
    where: { name: { [Op.in]: actorNames } }
  });
}

async function getById(id) {
  return await Movie.findOne({
    where: { id },
    include: [
      {
        model: Actor,
        as: 'actors',
        through: {
          attributes: []
        }
      }
    ]
  });
}

async function create(createDto, options = {}) {
  validateCreateDto(createDto);

  const isMovieExists = await Movie.findOne({
    where: { title: createDto.title }
  });

  if (isMovieExists) {
    throw ApiException.BadRequest(['title'], exceptionCodes.notUnique);
  }

  const actors = await getActors(createDto.actors);

  const movie = await Movie.create({
    title: createDto.title,
    year: createDto.year,
    format: createDto.format
  });

  await movie.addActors(actors);

  if (options.actorsInResponse) {
    return { ...movie.get(), actors };
  }

  return movie.get();
}

async function remove(id) {
  const movieToRemove = await Movie.findOne({ where: { id } });

  if (!movieToRemove) {
    throw ApiException.NotFound({ customError: true });
  }

  await movieToRemove.destroy();
}

async function update(id, updateDto) {
  validateUpdateDto(updateDto);

  const movieToUpdate = await Movie.findOne({
    where: { id }
  });

  if (!movieToUpdate) {
    throw ApiException.NotFound({ customError: true });
  }

  const newActors = updateDto.actors ? await getActors(updateDto.actors) : null;

  if (newActors) {
    await movieToUpdate.setActors(newActors);
  }

  await movieToUpdate.update({
    title: updateDto.title || movieToUpdate.title,
    year: updateDto.year || movieToUpdate.year,
    format: updateDto.format || movieToUpdate.format
  });

  return await getById(id);
}

async function getOneById(id) {
  const movie = await getById(id);

  if (!movie) {
    throw ApiException.NotFound({ customError: true });
  }

  return movie;
}

async function getMany(queryParams) {
  const movies = await Movie.findAll({
    limit: queryParams.limit || 20,
    offset: queryParams.offset || 0,
    where: {
      title: {
        [Op.substring]: queryParams.title || ''
      },
      [Op.or]: {
        title: { [Op.substring]: queryParams.search || '' },
        '$actors.name$': { [Op.substring]: queryParams.search || '' }
      }
    },
    order: [[queryParams.sort || 'id', queryParams.order || 'ASC']],
    include: [
      {
        model: Actor,
        as: 'actors',
        where: {
          name: {
            [Op.substring]: queryParams.actor || ''
          }
        },
        attributes: [],
        through: {
          attributes: []
        },
        duplicating: false
      }
    ]
  });

  return movies;
}

async function setManyFromFile(moviesFile) {
  const movies = parseMany(moviesFile.data.toString('utf8'));
  const moviesCreation = movies.map((movie) => create(movie));

  const imported = await Promise.allSettled(moviesCreation);
  const importedSuccessfully = imported
    .filter(({ status }) => status === 'fulfilled')
    .map(({ value }) => ({ ...value }));

  return [importedSuccessfully, imported.length];
}

module.exports = {
  create,
  remove,
  update,
  getOneById,
  getMany,
  setManyFromFile
};
