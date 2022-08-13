const ApiException = require('../exceptions/ApiException');

function errorMiddleware(error, req, res, next) {
  console.log(error);

  if (error instanceof ApiException) {
    const { statusCode, error: customError } = error;

    res.status(statusCode).send({
      error: customError,
      status: 0
    });

    return;
  }

  res.status(500).send({
    message: 'Unexpected error',
    status: 0
  });
}

module.exports = errorMiddleware;
