const exceptionCodes = require('./validatorExceptionCodes');

class ApiException extends Error {
  constructor(statusCode, fields, code, fieldValue = '', options = {}) {
    super();

    const errorFields = fields.reduce((prevFields, field) => {
      return { ...prevFields, [field]: fieldValue || code };
    }, {});

    let errorCode;

    if (options.customError) {
      errorCode = code;
    } else {
      errorCode =
        fields.length === 1 ? `${fields[0].toUpperCase()}_${code}` : code;
    }

    this.statusCode = statusCode;
    this.error = {
      fields: errorFields,
      code: errorCode
    };
  }

  static BadRequest(fields, code, fieldValue, options) {
    return new ApiException(400, fields, code, fieldValue, options);
  }

  static Unauthorized(fields, code) {
    return new ApiException(401, fields, code);
  }

  static NotFound(fieldValue) {
    return new ApiException(404, ['id'], exceptionCodes.notFound, fieldValue);
  }

  static Conflict() {
    return new ApiException(409, ['email'], exceptionCodes.notUnique);
  }
}

module.exports = ApiException;
