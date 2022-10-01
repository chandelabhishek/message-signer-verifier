const { StatusCodes } = require("http-status-codes");

const validApiKeys = process.env.AUTH_API_KEYS.split(",").map((x) => x.trim());

module.exports = function checkAuth(fastify) {
  fastify.addHook("preHandler", (request, reply, done) => {
    const apiKey = request.headers?.authorization;

    if (!validApiKeys.includes(apiKey)) {
      reply.status(StatusCodes.UNAUTHORIZED).send();
    }

    done();
  });
};
