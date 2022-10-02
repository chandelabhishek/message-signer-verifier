const setupServer = require("./api-server");
const setupShutDownHandlers = require("./shutdown");

const { SERVER_PORT, SERVER_HOST } = process.env;
const start = async () => {
  try {
    const server = await setupServer();
    await server.start(SERVER_PORT, SERVER_HOST);
    // setup handlers to shutdwn this process gracefully
    setupShutDownHandlers(server);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  }
};
start();
