module.exports = function handleShutdownsGracefully(fastify) {
  function cleanupResorces() {
    fastify.close();
    process.emit("cleanup");
  }

  process.stdin.resume();
  process.on("exit", () => cleanupResorces());
  process.on("SIGINT", () => cleanupResorces());
  process.on("uncaughtException", () => cleanupResorces());
};
