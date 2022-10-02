/* eslint-disable camelcase */
const { SIGN_URL, RETRY_ERROR_CODES } = process.env;
const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const makeGetApiCall = require("./api-caller");
const bullMQJobScheduler = require("./publisher/job-scheduler");
const getApiCallLogRepository = require("../repository/api-call-log");

const ACCEPTED = "ACCEPTED";

/**
 * Get All the retriable codes from the env vars
 */
const retryErrorCodes = RETRY_ERROR_CODES.split(",").map((el) =>
  parseInt(el.trim(), 10)
);
const rateLimiter = require("./rate-limiter");
const TimeoutError = require("../exception/timeout-error");

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
      updatedAt: new Date(),
    });

    await jobScheduler.publish({
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
      logger.info("Allowed api call limit reached, adding it to the queue");
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
    await scheduleRetry(id, payload);
    return reply.code(StatusCodes.ACCEPTED).send(ACCEPTED);
  }

  function isErrorRetriable(error) {
    return retryErrorCodes.includes(error.statusCode);
  }

  function handleApiRequestError(id, payload, error, reply) {
    logger.info(
      `request with payload: ${JSON.stringify(
        payload,
        null,
        2
      )} failed with error: ${JSON.stringify(error, null, 2)}`
    );
    if (
      error instanceof TimeoutError || // this is to handle axios timeouts
      isErrorRetriable(error)
    ) {
      logger.info(`adding request with id: ${id} to queue to process later`);
      return returnAccptedAndSchedulRetry(id, payload, reply);
    }
    throw error;
  }

  /**
   *
   * @param {*} reply reply object from pino
   * @param {*} payload request body
   * @returns response
   */
  // eslint-disable-next-line consistent-return
  async function callSign(reply, payload) {
    logger.info({ message: "received payload", payload });
    const { requestStatus, id, response, retryScheduled } =
      await apiCallLogRepository.getOrCreateCallLog(payload);

    // check if this message has already been signed then return the cached response
    if (requestStatus === StatusCodes.OK) {
      logger.info(
        {
          message: payload.message,
        },
        `  was already signed returning cached response`
      );
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
      logger.info(
        {
          message: payload.message,
        },
        `message: ${payload.message} is already scheduled`
      );
      return reply.code(StatusCodes.ACCEPTED).send(ACCEPTED);
    }

    try {
      const resp = await makeSignCall(payload);
      if (resp === ACCEPTED) {
        return returnAccptedAndSchedulRetry(id, payload, reply);
      }

      await handleSignSuccessResponse(id)(resp);
      return resp.data;
    } catch (error) {
      await handleApiRequestError(id, payload, error, reply);
    }
  }

  // function callVerify() {
  //   return makeGetApiCall(VERIFY_URL);
  // }

  return { callSign, makeSignCall, handleSignSuccessResponse };
}

/**
 * Prepare the signCallerService
 * @returns signCallerService
 */
function getSignCaller() {
  return signCaller(getApiCallLogRepository(), bullMQJobScheduler, rateLimiter);
}

module.exports = getSignCaller;
