const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = function getWebhookCallLogRepository() {
  function addWebhookCallLog({ apiCallLogId, lastCallResponse }) {
    return prisma.webhookCallLog.create({
      data: {
        apiCallLogId,
        lastCallResponse,
      },
    });
  }

  return { addWebhookCallLog };
};
