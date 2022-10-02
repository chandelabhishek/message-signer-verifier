// @ts-check
/**
 * @type {Object.<Object, string>}
 */

const { StatusCodes } = require("http-status-codes");

/**
 * @type {Object.<string, {name: string, message: string, httpStatusCode: number}>}
 */
const ResponseCodes = {
  /** @constant */
  ROUTE_NOT_FOUND: {
    name: "ROUTE_NOT_FOUND",
    message: "Route not found",
    httpStatusCode: StatusCodes.NOT_FOUND,
  },
  /** @constant */
  API_TIMEOUT_ERROR: {
    name: "API_TIMEOUT_ERROR",
    message: "synthesia api timed out",
    httpStatusCode: StatusCodes.REQUEST_TIMEOUT,
  },
  /** @constant */
  BAD_GATEWAY_ERROR: {
    name: "BAD_GATEWAY_ERROR",
    message: "synthesia api returned simulated bad gateway error",
    httpStatusCode: StatusCodes.BAD_GATEWAY,
  },
};

module.exports = ResponseCodes;
