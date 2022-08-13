const { Logger } = require('sequelize/lib/utils/logger');

class ApiException extends Error {
  constructor(statusCode, fields, code) {
    super();

    const errorFields = fields.reduce((prevFields, field) => {
      return { ...prevFields, [field]: code };
    }, {});

    const errorCode =
      fields.length === 1 ? `${fields[0].toUpperCase()}_${code}` : code;

    this.statusCode = statusCode;
    this.error = {
      fields: errorFields,
      code: errorCode
    };
  }

  static BadRequest(fields, code) {
    return new ApiException(400, fields, code);
  }

  static Unauthorized() {
    return new ApiException(401);
  }

  static Forbidden() {
    return new ApiException(403);
  }

  static NotFound() {
    return new ApiException(404);
  }
}

module.exports = ApiException;
