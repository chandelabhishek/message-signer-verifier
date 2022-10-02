/**
 *
 * Schedule retry jobs which will call synthesia sign api
 */
const { Queue } = require("bullmq");
const { connection } = require("../../worker/config");

module.exports = function getPublisher(jobQueueName, jobName, queueConfig) {
  const queue = new Queue(jobQueueName, { connection });

  function publish(payload) {
    queue.add(jobName, { payload }, queueConfig);
  }

  return { publish };
};
