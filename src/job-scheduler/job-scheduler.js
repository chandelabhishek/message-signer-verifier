const { Queue } = require("bullmq");
const { JOB_QUEUE_NAME, JOB_NAME } = require("../constant");
const { connection, queueConfig } = require("./config");

const queue = new Queue(JOB_QUEUE_NAME, { connection });

async function schedule(payload) {
  queue.add(JOB_NAME, { payload }, queueConfig);
}

module.exports = { schedule };
