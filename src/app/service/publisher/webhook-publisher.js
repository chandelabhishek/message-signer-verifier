const { WEBHOOK_EVENT, WEBHOOK_QUEUE_NAME } = require("../../constant");
const { webhookEventConfig } = require("../../worker/config");
const getPublisher = require("./publisher");

async function publish(payload) {
  const webhookPublisher = getPublisher(
    WEBHOOK_QUEUE_NAME,
    WEBHOOK_EVENT,
    webhookEventConfig
  );
  await webhookPublisher.publish(payload);
}

module.exports = { publish };
