const getCallerService = require("../service/sign-verify-caller");

/**
 *
 * @returns controller
 */
function getController() {
  const { callSign } = getCallerService();

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
