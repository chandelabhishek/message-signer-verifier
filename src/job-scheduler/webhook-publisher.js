const { Queue } = require("bullmq");
const { WEBHOOK_EVENT, WEBHOOK_QUEUE_NAME } = require("../constant");
const { connection, webhookEventConfig } = require("./config");

const queue = new Queue(WEBHOOK_QUEUE_NAME, { connection });

async function publish(payload) {
  queue.add(WEBHOOK_EVENT, { payload }, webhookEventConfig);
}

module.exports = { publish };
