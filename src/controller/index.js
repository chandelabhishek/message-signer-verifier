const getCallerService = require("../service/sign-verify-caller");
const getApiCallLogRepository = require("../repository/api-call-log");
/**
 *
 * @param {*} knex  -- DB connection
 * @returns controller
 */
function getController(knex) {
  const apiCallLogRepository = getApiCallLogRepository(knex);
  const { callSign, callVerify } = getCallerService(apiCallLogRepository);

  function signController(request, reply) {
    const { message, webhookUrl } = request.body;
    return callSign(reply, { knex, message, webhookUrl });
  }

  function verifyController(request) {
    const { message, webhook } = request.query;
    return callVerify({ knex, message, webhook });
  }

  return {
    signController,
    verifyController,
  };
}

module.exports = getController;
