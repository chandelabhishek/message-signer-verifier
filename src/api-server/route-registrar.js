const getController = require("../controller");

async function registerRoutes(fastify) {
  const { signController } = getController();

  fastify.addSchema({
    $id: "sign",
    type: "object",
    required: ["clientRequestId", "message"],
    properties: {
      clientRequestId: { type: "string" },
      message: { type: "string" },
      webhookUrl: {
        type: "string",
      },
      webhookHeaders: {
        type: "object",
        properties: {},
      },
    },
  });

  fastify.post(
    "/sign",
    {
      schema: {
        body: {
          $ref: "sign",
        },
        tags: ["sign"],
        response: {
          200: { type: "string", description: "signed message" },
          202: {
            type: "string",
            description: "job to sign the message has been accepted",
          },
        },
      },
    },
    signController
  );

  fastify.get("/", () => "I am home");
}

module.exports = registerRoutes;
