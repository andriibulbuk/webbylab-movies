const sessionService = require('./sessionsService');

async function createSession(req, res) {
  const response = await sessionService.create(req.body);

  res.send(response);
}

const sessionsController = { createSession };

module.exports = sessionsController;
