/* eslint-disable camelcase */
const { SIGN_URL, VERIFY_URL, RETRY_ERROR_CODES } = process.env;
const { StatusCodes } = require("http-status-codes");
const makeGetApiCall = require("./api-caller");
const bullMQJobScheduler = require("../job-scheduler/job-scheduler");
const getApiCallLogRepository = require("../repository/api-call-log");

function signCaller(apiCallLogRepository, jobScheduler) {
  async function scheduleRetry(callLogId, payload) {
    await apiCallLogRepository.updateCallLogById(callLogId, {
      retry_scheduled: true,
    });

    await jobScheduler.schedule({
      callLogId,
      ...payload,
    });
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
    console.log("payload ========>", payload);
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
          await scheduleRetry(id, payload);
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

function getSignCaller(knex) {
  return signCaller(getApiCallLogRepository(knex), bullMQJobScheduler);
}

module.exports = getSignCaller;
