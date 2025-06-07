const { StatusCodes } = require('http-status-codes');

class CustomError extends Error {
  status;
  message;
  constructor(status, message) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

const serverErrs = {
  BAD_REQUEST: (msg) => new CustomError(StatusCodes.BAD_REQUEST, msg),
  UNAUTHORIZED: (msg) => new CustomError(StatusCodes.UNAUTHORIZED, msg),
  FORBIDDEN: (msg) => new CustomError(StatusCodes.FORBIDDEN, msg),
};

module.exports = { CustomError, serverErrs };