const { isEmpty } = require("lodash");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = function getApiCallLogRepository(db = prisma) {
  function getOrCreateCallLog(callLogObject) {
    return db.$transaction(async (trx) => {
      const entry = await trx.apiCallLog.findFirst({
        where: { requestMessage: callLogObject.message },
      });

      if (isEmpty(entry)) {
        return trx.apiCallLog.create({
          data: {
            clientRequestId: callLogObject.clientRequestId,
            requestMessage: callLogObject.message,
            webhookUrl: callLogObject.webhookUrl,
          },
        });
      }

      if (entry.webhookUrl !== callLogObject.webhookUrl) {
        return trx.apiCallLog.update({
          data: {
            webhookUrl: callLogObject.webhookUrl,
            clientRequestId: callLogObject.clientRequestId,
          },
          where: { id: entry.id },
        });
      }

      return entry;
    });
  }

  function updateCallLogById(id, object) {
    return db.apiCallLog.update({ data: object, where: { id } });
  }

  return { getOrCreateCallLog, updateCallLogById };
};
