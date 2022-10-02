const { isEmpty } = require("lodash");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 *
 * @param {*} db connection
 * @returns ApiCallRepository
 *
 */
module.exports = function getApiCallLogRepository(db = prisma) {
  /**
   * @param {*} callLogObject received from client
   * @returns a call log object
   */
  function getOrCreateCallLog(callLogObject) {
    // putting multiple db calls in a transaction,so that they use a signle db connection
    return db.$transaction(async (trx) => {
      // see if a message already exists in the db
      const entry = await trx.apiCallLog.findFirst({
        where: { requestMessage: callLogObject.message },
      });

      // if message does not exist in the db
      if (isEmpty(entry)) {
        return trx.apiCallLog.create({
          data: {
            clientRequestId: callLogObject.clientRequestId,
            requestMessage: callLogObject.message,
            webhookUrl: callLogObject.webhookUrl,
          },
        });
      }

      // return the existing record from the db
      return entry;
    });
  }

  function updateCallLogById(id, object) {
    // the call log when let's say the response to synthesia call was success
    return db.apiCallLog.update({ data: object, where: { id } });
  }

  return { getOrCreateCallLog, updateCallLogById };
};

process.on("cleanup", () => {
  prisma.$disconnect();
});
