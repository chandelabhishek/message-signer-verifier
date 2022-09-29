const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const pino = require("pino");

const { SERVER_PORT } = process.env;
const fastify = require("fastify")({
  logger: pino,
});
const routeRegistrar = require("./route-registrar");
const pluginRegistrar = require("./plugin-regitrar");

/**
 * Run the server!
 */
const start = async () => {
  try {
    routeRegistrar(fastify);
    await pluginRegistrar(fastify);
    await fastify.listen({ port: SERVER_PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
