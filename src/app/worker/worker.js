/**
 * Workers for scheduled retry jobs which will actually call synthesia api
 */

const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);
const { Worker } = require("bullmq");
const { connection } = require("./config");
const logger = require("../logger");

module.exports = function registerWorker(queueName, handler) {
  const worker = new Worker(queueName, handler, { connection });

  worker.on("completed", (job) => {
    logger.info(`${job.id} has completed!`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`${job.id} has failed with ${err.message}`);
  });

  worker.on("error", (err) => {
    logger.error(err);
  });

  logger.info(
    `==============================================   ${queueName}-WORKER  STARTED!!!!  =================================================`
  );
};
