const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);
const logger = require("../logger");
// eslint-disable-next-line import/order
const fastify = require("fastify")({
  logger,
});

const routeRegistrar = require("./route-registrar");
const pluginRegistrar = require("./plugin-regitrar");
const hookRegistrar = require("./hook-registrar");

const server = async () => {
  await pluginRegistrar(fastify);
  routeRegistrar(fastify);
  hookRegistrar(fastify);

  async function start(port, host) {
    await fastify.listen({ port, host });
  }

  return { start };
};

module.exports = server;
