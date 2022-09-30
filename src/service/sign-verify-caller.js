/* eslint-disable camelcase */
const { SIGN_URL, VERIFY_URL, RETRY_ERROR_CODES } = process.env;
const { StatusCodes } = require("http-status-codes");
const makeGetApiCall = require("./api-caller");
const bullMQJobScheduler = require("../job-scheduler/job-scheduler");
const getApiCallLogRepository = require("../repository/api-call-log");

const ACCEPTED = "ACCEPTED";

/**
 * Get All the retriable codes from the env vars
 */
const retryErrorCodes = RETRY_ERROR_CODES.split(",").map((el) =>
  parseInt(el.trim(), 10)
);
const rateLimiter = require("./rate-limiter");

/**
 *
 * @param {*} apiCallLogRepository
 * @param {*} jobScheduler
 * @param {*} rateLimiterService
 * @returns signCallerService
 */

function signCaller(apiCallLogRepository, jobScheduler, rateLimiterService) {
  /**
   *
   * @param {*} callLogId
   * @param {*} payload
   *
   * schedules backoff retries
   */
  async function scheduleRetry(callLogId, payload) {
    await apiCallLogRepository.updateCallLogById(callLogId, {
      retryScheduled: true,
    });

    await jobScheduler.schedule({
      callLogId,
      ...payload,
    });
  }

  /**
   *
   * @param {*} callLogId
   * @returns updated apiCallLog
   *
   * Logs sucessful response from synthesia sign api in the database
   */
  function handleSignSuccessResponse(callLogId) {
    return ({ status, data }) =>
      apiCallLogRepository.updateCallLogById(callLogId, {
        requestStatus: status,
        response: data,
      });
  }

  /**
   *
   * @param {*} payload  to call synthesia sign api
   * @param {*} options  if any option to be passed to axios
   * @returns response from synthesia sign api
   */

  async function makeSignCall(payload, options = {}) {
    // checking if syntheisa sign api can be called
    const canNotBeCalled = await rateLimiterService.isOverTheLimit();

    if (canNotBeCalled) {
      return ACCEPTED;
    }

    // adding this request to rate limiter service
    await rateLimiterService.addRequestToRateLimitWndow();
    return makeGetApiCall(
      SIGN_URL,
      {
        message: payload.message,
      },
      options
    );
  }

  async function returnAccptedAndSchedulRetry(id, payload, reply) {
    reply.status(StatusCodes.ACCEPTED);
    await scheduleRetry(id, payload);
  }

  /**
   *
   * @param {*} reply reply object from fastify
   * @param {*} payload request body
   * @returns response
   */
  // eslint-disable-next-line consistent-return
  async function callSign(reply, payload) {
    const { requestStatus, id, response, retryScheduled } =
      await apiCallLogRepository.getOrCreateCallLog(payload);

    // check if this message has already been signed then return the cached response
    if (requestStatus === StatusCodes.OK) {
      return response;
    }

    /**
     * check if this message has already been scheduled for retry,
     * if yes,
     *  return accepted and do nothing, let the already scheduled job complete
     *
     * this is done after observing that syntheisa sign api continuously fails for the same message
     */
    if (retryScheduled) {
      reply.status(StatusCodes.ACCEPTED);
      return ACCEPTED;
    }

    try {
      const resp = await makeSignCall(payload);
      if (resp === ACCEPTED) {
        return returnAccptedAndSchedulRetry(id, payload, reply);
      }

      await handleSignSuccessResponse(id);
      return resp.data;
    } catch (error) {
      if (
        error.code === "ECONNABORTED" || // this is to handle axios timeouts
        retryErrorCodes.includes(error.response?.status) // check if the error is retriable
      ) {
        return returnAccptedAndSchedulRetry(id, payload, reply);
      }
      return error;
    }
  }

  function callVerify() {
    return makeGetApiCall(VERIFY_URL);
  }

  return { callSign, callVerify, makeSignCall, handleSignSuccessResponse };
}

/**
 * Prepare the signCallerService
 * @returns signCallerService
 */
function getSignCaller() {
  return signCaller(getApiCallLogRepository(), bullMQJobScheduler, rateLimiter);
}

module.exports = getSignCaller;
