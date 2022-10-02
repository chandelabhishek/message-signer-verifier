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
    logger.error(
      "[UNCAUGHT_EXCEPTION]",
      `${new Date().toUTCString()}: Process will now exit. UncaughtException:`,
      err.message,
      err.stack
    );
    cleanupResorces();
  });
};
