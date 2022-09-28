const getController = require("./controller");

async function registerRoutes(fastify, knex) {
  const { signController, verifyController } = await getController(knex);
  fastify.post("/sign", signController);
  fastify.get("/verify", verifyController);
}

module.exports = registerRoutes;
