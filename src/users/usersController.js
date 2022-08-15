const usersService = require('./usersService');

async function create(req, res) {
  const token = await usersService.create(req.body);

  res.send({ status: 1, token });
}

const usersController = { create };

module.exports = usersController;
