const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 *
 * @param {*} db connection
 * @returns ApiCallRepository
 *
 */
module.exports = function getWebhookCallLogRepository(db = prisma) {
  /**
   * @param {*} Object add a log entry for webhook calling
   * @returns
   */
  function addWebhookCallLog({
    apiCallLogId,
    lastCallResponse,
    lastCallResponseStatus,
  }) {
    return db.webhookCallLog.create({
      data: {
        apiCallLogId,
        lastCallResponse,
        lastCallResponseStatus,
      },
    });
  }

  return { addWebhookCallLog };
};
