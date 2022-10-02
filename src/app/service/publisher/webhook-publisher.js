const { WEBHOOK_EVENT, WEBHOOK_QUEUE_NAME } = require("../../constant");
const { webhookEventConfig } = require("../../worker/config");
const getPublisher = require("./publisher");

const webhookPublisher = getPublisher(
  WEBHOOK_QUEUE_NAME,
  WEBHOOK_EVENT,
  webhookEventConfig
);

async function publish(payload) {
  await webhookPublisher.publish(payload);
}

module.exports = { publish };
