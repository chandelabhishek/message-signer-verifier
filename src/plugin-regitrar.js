const cors = require("@fastify/cors");
const helmet = require("@fastify/helmet");
const metricsPlugin = require("fastify-metrics");
const swaggerPlugin = require("@fastify/swagger");

async function pluginRegistrar(fastify) {
  await fastify.register(swaggerPlugin, {
    routePrefix: "/swagger",
    swagger: {
      info: {
        title: "Message Sign Swagger",
        description: "Testing the Fastify swagger API",
        version: "0.1.0",
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
      host: "localhost:4000",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [{ name: "sign", description: "API to sign a message reliably" }],
      securityDefinitions: {
        apiKey: {
          type: "apiKey",
          name: "apiKey",
          in: "header",
        },
      },
    },
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true,
  });
  await fastify.register(cors);
  await fastify.register(helmet);
  await fastify.register(metricsPlugin, { endpoint: "/metrics" });
}

module.exports = pluginRegistrar;
