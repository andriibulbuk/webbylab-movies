const moviesService = require('./moviesService');

async function create(req, res) {
  const createdMovie = await moviesService.create(req.body, {
    actorsInResponse: true
  });

  res.send({ status: 1, data: createdMovie });
}

async function remove(req, res) {
  await moviesService.remove(req.params.id);

  res.send({ status: 1 });
}

async function update(req, res) {
  const updatedMovie = await moviesService.update(req.params.id, req.body);

  res.send({ status: 1, data: updatedMovie });
}

async function getOne(req, res) {
  const foundMovie = await moviesService.getOneById(req.params.id);

  res.send({ status: 1, data: foundMovie });
}

async function getMany(req, res) {
  const foundMovies = await moviesService.getMany(req.query);

  res.send({
    status: 1,
    data: foundMovies,
    meta: { total: foundMovies.length }
  });
}

async function setManyFromFile(req, res) {
  const [imported, totalLength] = await moviesService.setManyFromFile(
    req.files.movies
  );

  res.send({
    status: 1,
    data: imported,
    meta: { total: totalLength, imported: imported.length }
  });
}

module.exports = { create, remove, update, getOne, getMany, setManyFromFile };
