const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const pino = require("pino");

const { SERVER_PORT, SERVER_HOST } = process.env;
const fastify = require("fastify")({
  logger: pino,
});
const routeRegistrar = require("./route-registrar");
const pluginRegistrar = require("./plugin-regitrar");
const hookRegistrar = require("./hook-registrar");
const handleShutdownsGracefully = require("./shutdown");
/**
 * Run the server!
 */
const start = async () => {
  try {
    await pluginRegistrar(fastify);
    routeRegistrar(fastify);
    hookRegistrar(fastify);
    await fastify.listen({ port: SERVER_PORT, host: SERVER_HOST });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

handleShutdownsGracefully(fastify);
