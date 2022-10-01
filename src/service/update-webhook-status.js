const getWebhookCallLogRepository = require("../repository/webhook-call-log");

/**
 *
 * @param {*} webhookCallLogRepository
 * @returns WebhookCallRepository
 */
function webhookResponseUpdater(webhookCallLogRepository) {
  /**
   *
   * @param {*} data received object from the webhook call
   * @returns updated webhook call log object
   */
  function updateWebhookResponse(data) {
    return webhookCallLogRepository.addWebhookCallLog(data);
  }

  return { updateWebhookResponse };
}

function getWebhookResponseUpdater() {
  return webhookResponseUpdater(getWebhookCallLogRepository());
}

module.exports = getWebhookResponseUpdater;
