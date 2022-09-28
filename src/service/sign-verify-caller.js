/* eslint-disable camelcase */
const { SIGN_URL, VERIFY_URL, RETRY_ERROR_CODES } = process.env;
const { StatusCodes } = require("http-status-codes");
const makeGetApiCall = require("./api-caller");
const bullMQJobScheduler = require("../job-scheduler/scheduler");

const retryErrorCodes = RETRY_ERROR_CODES.split(",").map((el) =>
  parseInt(el.trim(), 10)
);

function signCaller(apiCallLogRepository, jobScheduler = bullMQJobScheduler) {
  async function scheduleRetry(callLogId, message) {
    await apiCallLogRepository.updateCallLogById(callLogId, {
      retry_scheduled: true,
    });

    await jobScheduler.schedule({ callLogId, message });
  }

  function handleSignSuccessResponse(callLogId) {
    return ({ status, data }) =>
      apiCallLogRepository
        .updateCallLogById(callLogId, {
          request_status: status,
          response: data,
        })
        .then(() => data);
  }

  function makeSignCall(payload) {
    return makeGetApiCall(SIGN_URL, {
      message: payload.message,
    });
  }

  async function callSign(reply, payload) {
    const { request_status, id, response, retry_scheduled } =
      await apiCallLogRepository.getOrCreateCallLog(payload);

    if (request_status === StatusCodes.OK) {
      return response;
    }

    if (retry_scheduled === true) {
      reply.status(StatusCodes.ACCEPTED);
      return "ACCPTED";
    }

    return makeSignCall(payload)
      .then(handleSignSuccessResponse(id))
      .catch(async (error) => {
        if (
          error.code === "ECONNABORTED" ||
          retryErrorCodes.includes(error.response.status)
        ) {
          reply.status(StatusCodes.ACCEPTED);
          await scheduleRetry(id, payload.message);
          // schedule retry
        } else {
          return error;
        }
      });
  }

  function callVerify() {
    return makeGetApiCall(VERIFY_URL);
  }

  return { callSign, callVerify, makeSignCall, handleSignSuccessResponse };
}

module.exports = signCaller;
