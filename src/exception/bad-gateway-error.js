const ResponseCodes = require("./response-codes");

class BadGatewayError extends Error {
  constructor(message) {
    super(ResponseCodes.BAD_GATEWAY_ERROR.name, message);
    this.statusCode = ResponseCodes.BAD_GATEWAY_ERROR.httpStatusCode;
    this.message = message || ResponseCodes.BAD_GATEWAY_ERROR.message;
  }
}

module.exports = BadGatewayError;
