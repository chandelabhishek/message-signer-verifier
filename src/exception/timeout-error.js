const ResponseCodes = require("./response-codes");

class TimeoutError extends Error {
  constructor(message) {
    super(ResponseCodes.API_TIMEOUT_ERROR.name, message);
    this.statusCode = ResponseCodes.API_TIMEOUT_ERROR.httpStatusCode;
    this.message = message || ResponseCodes.API_TIMEOUT_ERROR.message;
  }
}

module.exports = TimeoutError;
