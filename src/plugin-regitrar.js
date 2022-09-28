const cors = require("@fastify/cors");
const helmet = require("@fastify/helmet");
const metricsPlugin = require("fastify-metrics");

async function pluginRegistrar(fastify) {
  await fastify.register(cors);
  await fastify.register(helmet);
  await fastify.register(metricsPlugin, { endpoint: "/metrics" });
}

module.exports = pluginRegistrar;
