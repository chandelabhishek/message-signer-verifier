const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);
const logger = require("../logger");
// eslint-disable-next-line import/order
const fastify = require("fastify")({
  logger,
});

const registerRoutes = require("./route-registrar");
const registerPlugins = require("./plugin-regitrar");
const registerHooks = require("./hook-registrar");

const server = async () => {
  await registerPlugins(fastify);
  await registerRoutes(fastify);
  registerHooks(fastify);

  async function start(port, host) {
    await fastify.listen({ port, host });
  }

  return { start, fastify };
};

module.exports = server;
