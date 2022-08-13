const usersService = require('./usersService');

async function create(req, res) {
  const response = await usersService.create(req.body);

  res.send(response);
}

const usersController = { create };

module.exports = usersController;
