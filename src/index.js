require("dotenv").config();
const pino = require("pino");

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, SERVER_PORT } =
  process.env;
const knex = require("knex")({
  client: "pg",
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
});
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
    routeRegistrar(fastify, knex);
    await pluginRegistrar(fastify);
    await fastify.listen({ port: SERVER_PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
