/**
 *
 * Schedule retry jobs which will call synthesia sign api
 */
const { Queue } = require("bullmq");
const { JOB_QUEUE_NAME, JOB_NAME } = require("../constant");
const { connection, jobQueueConfig } = require("./config");

const queue = new Queue(JOB_QUEUE_NAME, { connection });

async function schedule(payload) {
  queue.add(JOB_NAME, { payload }, jobQueueConfig);
}

module.exports = { schedule };
