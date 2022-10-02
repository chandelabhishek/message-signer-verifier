const ResponseCodes = require("./response-codes");

module.exports = () => (request, reply) => {
  const endpoint =
    request.raw.url || request.raw.originalUrl || request.params["*"] || "";
  const error = ResponseCodes.ROUTE_NOT_FOUND.name;
  const message = `Route ${endpoint} not found`;
  reply
    .code(ResponseCodes.ROUTE_NOT_FOUND.httpStatusCode)
    .send({ error, message });
};
