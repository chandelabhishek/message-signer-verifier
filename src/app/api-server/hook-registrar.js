const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const validApiKeys = process.env.AUTH_API_KEYS.split(",").map((x) => x.trim());
const restrictedUrls = process.env.RESTRICTED_URLS.split(",").map((x) =>
  x.trim()
);
module.exports = function checkAuth(fastify) {
  fastify.addHook("preHandler", (request, reply, done) => {
    if (!restrictedUrls.includes(request.raw.url)) {
      done();
      return;
    }
    const apiKey = request.headers?.authorization;

    /** Adding constant time comparison to eliminate timing attacks */
    if (
      !validApiKeys.some((validKey) =>
        crypto.timingSafeEqual(
          Buffer.from(apiKey, "utf8"),
          Buffer.from(validKey, "utf8")
        )
      )
    ) {
      reply.status(StatusCodes.UNAUTHORIZED).send();
    }

    done();
  });
};
