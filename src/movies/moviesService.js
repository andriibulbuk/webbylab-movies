const { Movie, Actor } = require('./movieModel');
const { Op } = require('sequelize');
const ApiException = require('../exceptions/ApiException');
const exceptionCodes = require('../exceptions/validatorExceptionCodes');

function checkForForbiddenSymbols(string) {
  const FORBIDDEN_CHARS_EXP = /[^\sa-zA-Zа-яА-ЯіІїЇґҐєЄ,-]/g;

  return FORBIDDEN_CHARS_EXP.test(string);
}

function removeRedundantSpaces(string) {
  const REDUNDANT_SPACES_EXP = /\s{2,}/g;

  return string.trim().replace(REDUNDANT_SPACES_EXP, '');
}

function normalizeActorNames(actorNames) {
  return actorNames.map((actor) => removeRedundantSpaces(actor));
}

function validateDtoTitle(title) {
  const MIN_TITLE_LENGTH = 2;

  if (
    typeof title !== 'string' ||
    removeRedundantSpaces(title).length < MIN_TITLE_LENGTH
  ) {
    throw ApiException.BadRequest(['title'], exceptionCodes.notValid, title);
  }
}

function validateDtoYear(year) {
  const FIRST_MOVIE_YEAR = 1888;
  const MAX_AVAILABLE_YEAR = 2050;

  if (
    typeof year !== 'number' ||
    year < FIRST_MOVIE_YEAR ||
    year > MAX_AVAILABLE_YEAR
  ) {
    throw ApiException.BadRequest(['year'], exceptionCodes.notValid, year);
  }
}

function validateDtoFormat(format) {
  const formatsEnum = {
    VHS: true,
    DVD: true,
    'Blu-Ray': true
  };

  if (typeof format !== 'string' || !formatsEnum[format]) {
    throw ApiException.BadRequest(['format'], exceptionCodes.notValid, format);
  }
}

function validateDtoActors(actors) {
  const MIN_NAME_LENGTH = 5;

  if (!Array.isArray(actors)) {
    throw ApiException.BadRequest(['actors'], exceptionCodes.notValid);
  }

  actors.forEach((actor) => {
    if (
      typeof actor !== 'string' ||
      checkForForbiddenSymbols(actor) ||
      removeRedundantSpaces(actor).length < MIN_NAME_LENGTH
    ) {
      throw ApiException.BadRequest(
        ['actors'],
        exceptionCodes.notValid,
        actors
      );
    }
  });
}

function validateCreateDto({ title, year, format, actors }) {
  validateDtoTitle(title);
  validateDtoYear(year);
  validateDtoFormat(format);
  validateDtoActors(actors);
}

function validateUpdateDto({ title, year, format, actors }) {
  if (!title && !year && !format && !actors) {
    throw ApiException.BadRequest([], exceptionCodes.notValid);
  }

  if (title) {
    validateDtoTitle(title);
  }

  if (year) {
    validateDtoYear(year);
  }

  if (format) {
    validateDtoFormat(format);
  }

  if (actors) {
    validateDtoActors(actors);
  }
}

function parseOne(movie) {
  const [title, year, format, actors] = movie.split('\n');

  return { title, year: +year, format, actors: actors.split(', ') };
}

function parseMany(data) {
  try {
    return data
      .replace(/Title: |Release Year: |Format: |Stars: /g, '')
      .trim()
      .split('\n\n')
      .map((movie) => parseOne(movie));
  } catch (error) {
    throw ApiException.BadRequest(['movies'], exceptionCodes.parsingError);
  }
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
    throw ApiException.BadRequest(
      ['title'],
      `${exceptionCodes.notUnique}`,
      removeRedundantSpaces(createDto.title)
    );
  }

  const normalizedActorNames = normalizeActorNames(createDto.actors);
  const actors = await getActors(normalizedActorNames);

  const movie = await Movie.create({
    title: removeRedundantSpaces(createDto.title),
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
    throw ApiException.NotFound(+id);
  }

  return movie;
}

async function getMany(queryParams) {
  const response = await Movie.findAll({
    limit: +queryParams.limit || 20,
    offset: +queryParams.offset || 0,
    group: 'Movie.id',
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

  if (queryParams.sort === 'title') {
    response.sort((a, b) => a.title.localeCompare(b.title));
  }

  return response;
}

async function setManyFromFile(files) {
  if (!files || !files.movies) {
    throw ApiException.BadRequest(
      ['movies'],
      `FILE_${exceptionCodes.notFound}`
    );
  }

  if (files.movies.mimetype !== 'text/plain') {
    throw ApiException.BadRequest(
      ['movies'],
      `FILE_${exceptionCodes.forbiddenFileExtension}`
    );
  }

  const movies = parseMany(files.movies.data.toString('utf8'));
  const moviesCreation = movies.map((movie) => create(movie));

  const imported = await Promise.allSettled(moviesCreation);
  const importedSuccessfully = [];
  const notImported = [];

  imported.forEach((response) => {
    if (response.status === 'fulfilled') {
      importedSuccessfully.push(response.value);
    } else {
      notImported.push(response.reason.error);
    }
  });

  return [importedSuccessfully, imported.length, notImported];
}

module.exports = {
  create,
  remove,
  update,
  getOneById,
  getMany,
  setManyFromFile
};
