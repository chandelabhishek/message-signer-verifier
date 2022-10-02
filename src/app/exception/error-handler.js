const logger = require("../logger");
const ErrorBuilder = require("./error-builder");

const urlBuilder = (host, path, protocol = "https") =>
  new URL(path, `${protocol}://${host}`).href;

module.exports = function errorHandler() {
  const errorBuilder = new ErrorBuilder();

  return (error, request, reply) => {
    const absoluteUrl = urlBuilder(
      request.hostname,
      request.raw.url,
      request.protocol
    );
    logger.error({
      error,
      errorMessage: error.mesage,
      url: absoluteUrl,
      query: request.query,
      body: request.body,
      method: request.raw.method,
    });
    const formattedError = errorBuilder.build(error, request);
    reply.code(formattedError.code).send(formattedError.errors);
  };
};
