const { isEmpty, first } = require("lodash");

module.exports = function getWebhookCallLogRepository(knex) {
  async function addWebhookCallLog(callLogObject) {
    return knex("webhhook_call_log").insert({});
  }

  return { addWebhookCallLog };
};
