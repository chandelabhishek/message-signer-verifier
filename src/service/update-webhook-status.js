const getWebhookCallLogRepository = require("../repository/webhook-call-log");

function webhookResponseUpdater(webhookCallLogRepository) {
  function updateWebhookResponse(data) {
    console.log("updateWebhookResponse ==>", data);
    return webhookCallLogRepository.addWebhookCallLog(data);
  }
  return { updateWebhookResponse };
}

function getWebhookResponseUpdater() {
  return webhookResponseUpdater(getWebhookCallLogRepository());
}

module.exports = getWebhookResponseUpdater;
