/**
 *
 * Schedule retry jobs which will call synthesia sign api
 */
const { JOB_QUEUE_NAME, JOB_NAME } = require("../../constant");
const { jobQueueConfig } = require("../../worker/config");
const getPublisher = require("./publisher");

async function publish(payload) {
  const jobPublisher = getPublisher(JOB_QUEUE_NAME, JOB_NAME, jobQueueConfig);
  await jobPublisher.publish(payload);
}

module.exports = { publish };
