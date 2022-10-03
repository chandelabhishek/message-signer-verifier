const getCallerService = require("../service/sign-verify-caller");
const bullMQJobScheduler = require("../service/publisher/job-scheduler");
const ApiCallRepo = require("../repository/api-call-log");
const getRateLimiter = require("../service/rate-limiter");
/**
 *
 * @returns controller
 */
async function getController() {
  const { callSign } = getCallerService(
    ApiCallRepo(),
    bullMQJobScheduler,
    await getRateLimiter()
  );

  function signController(request, reply) {
    return callSign(reply, request.body);
  }

  // function verifyController(request) {
  //   const { message, webhook } = request.query;
  //   return callVerify({ message, webhook });
  // }

  return {
    signController,
    // verifyController,
  };
}

module.exports = getController;
