const { isEmpty, first } = require("lodash");

module.exports = function getApiCallLogRepository(knex) {
  async function getOrCreateCallLog(callLogObject) {
    return knex.transaction(async (trx) => {
      const transaction = trx("api_call_log");
      const entry = await transaction
        .select("*")
        .where({ request_message: callLogObject.message })
        .then(first);
      if (isEmpty(entry)) {
        return transaction
          .insert({
            client_request_id: callLogObject.clientRequestId,
            request_message: callLogObject.message,
            webhook_url: callLogObject.webhookUrl,
          })
          .returning("*")
          .then(first);
      }
      if (entry.webhook_url !== callLogObject.webhookUrl) {
        return transaction
          .update({
            webhook_url: callLogObject.webhookUrl,
            client_request_id: callLogObject.clientRequestId,
          })
          .where({ id: entry.id })
          .returning("*")
          .then(first);
      }
      return entry;
    });
  }

  function updateCallLogById(id, object) {
    return knex("api_call_log").update(object).where({ id });
  }

  return { getOrCreateCallLog, updateCallLogById };
};
