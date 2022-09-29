const getController = require("./controller");

async function registerRoutes(fastify) {
  const { signController, verifyController } = getController();
  fastify.post("/sign", signController);
  fastify.get("/verify", verifyController);
}

module.exports = registerRoutes;
