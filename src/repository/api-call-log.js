const { isEmpty } = require("lodash");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = function getApiCallLogRepository(db = prisma) {
  function getOrCreateCallLog(callLogObject) {
    // return knex.transaction(async (trx) => {
    //   const transaction = trx("api_call_log");
    //   const entry = await transaction
    //     .select("*")
    //     .where({ request_message: callLogObject.message })
    //     .then(first);
    //   if (isEmpty(entry)) {
    //     return transaction
    //       .insert({
    //         client_request_id: callLogObject.clientRequestId,
    //         request_message: callLogObject.message,
    //         webhook_url: callLogObject.webhookUrl,
    //       })
    //       .returning("*")
    //       .then(first);
    //   }
    //   if (entry.webhook_url !== callLogObject.webhookUrl) {
    //     return transaction
    //       .update({
    //         webhook_url: callLogObject.webhookUrl,
    //         client_request_id: callLogObject.clientRequestId,
    //       })
    //       .where({ id: entry.id })
    //       .returning("*")
    //       .then(first);
    //   }
    //   return entry;
    // });

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
    // return knex("api_call_log").update(object).where({ id });
    return db.apiCallLog.update({ data: object, where: { id } });
  }

  return { getOrCreateCallLog, updateCallLogById };
};
