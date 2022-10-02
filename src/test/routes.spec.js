const getServer = require("../app/api-server");

jest.mock("../app/controller", () => () => ({
  signController: jest.fn(async () => {}),
}));

describe("testing /sign route", () => {
  let server = null;

  beforeAll(async () => {
    server = await getServer();
  });

  it("should return 200", async () => {
    const response = await server.fastify.inject({
      method: "POST",
      url: "/sign",
      payload: {
        message: "5bb1e9b1-3eb2-4f40-a044-91024f6062ab",
        clientRequestId: "5bb1e9b1-3eb2-4f40-a044-91024f6062ab",
        webhookUrl: "http://2ed9-117-197-50-9.in.ngrok.io",
        webhookHeaders: {
          "x-auth": "ping-pong",
          "y-auth": "bing bing",
        },
      },
      headers: {
        Authorization: "333e2ef4e21d76bddb5eb70b9598aa7006bd0cfc88b35aa8",
      },
    });

    expect(response.statusCode).toBe(200);
  });
});
