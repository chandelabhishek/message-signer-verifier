const logger = require("./logger");

module.exports = function setupShutDownHandlers(fastify) {
  async function cleanupResorces() {
    await fastify.close();
    process.emit("cleanup");
  }

  process.stdin.resume();
  process.on("exit", () => cleanupResorces());
  process.on("SIGINT", () => cleanupResorces());
  process.on("uncaughtException", (err) => {
    logger.error({
      code: "[UNCAUGHT_EXCEPTION]",
      message: `${new Date().toUTCString()}: Process will now exit. UncaughtException:`,
      errorMessage: err.message,
      stackTrace: err.stack,
    });
    cleanupResorces();
  });
};
