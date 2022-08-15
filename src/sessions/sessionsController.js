const sessionService = require('./sessionsService');

async function createSession(req, res) {
  const token = await sessionService.create(req.body);

  res.send({ status: 1, token });
}

const sessionsController = { createSession };

module.exports = sessionsController;
