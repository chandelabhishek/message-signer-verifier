const getController = require("../controller");

async function registerRoutes(fastify) {
  const { signController } = await getController();

  fastify.addSchema({
    $id: "sign",
    type: "object",
    additionalProperties: false,
    required: ["clientRequestId", "message"],
    properties: {
      clientRequestId: { type: "string", format: "uuid" },
      message: { type: "string" },
      webhookUrl: {
        type: "string",
        format: "uri",
      },
      webhookHeaders: {
        type: "object",
        maxProperties: 3,
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
