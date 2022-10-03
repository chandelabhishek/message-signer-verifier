const getWebhookCallLogRepository = require("../repository/webhook-call-log");

/**
 *
 * @param {*} webhookCallLogRepository
 * @returns WebhookCallRepository
 */

function getWebhookResponseUpdater(
  webhookCallLogRepo = getWebhookCallLogRepository()
) {
  /**
   *
   * @param {*} data received object from the webhook call
   * @returns updated webhook call log object
   */
  function updateWebhookResponse(data) {
    return webhookCallLogRepo.addWebhookCallLog(data);
  }

  return { updateWebhookResponse };
}

module.exports = getWebhookResponseUpdater;
