/**
 * Workers for scheduled retry jobs which will actually call synthesia api
 */

const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const logger = require("../logger");

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const webhookPublisher = require("../service/publisher/webhook-publisher");
const { JOB_QUEUE_NAME } = require("../constant");
const getCallerService = require("../service/sign-verify-caller");
const registerWorker = require("./worker");

const apiCallerService = getCallerService();
const ACCEPTED = "ACCEPTED";

/**
 *
 * @param {*} job
 *
 * Performs the scheduled job
 */
async function callSignApi(job) {
  const { payload } = job.data;

  // call syhthesia api, set longer timeouts because it need not return response in 2sec
  const response = await apiCallerService.makeSignCall(payload, {
    timeout: 30000,
  });

  // if the call was rate limited fail the job, so it cab be `retried`
  if (response === ACCEPTED) {
    throw new Error("This call has been rate limited");
  }

  await apiCallerService.handleSignSuccessResponse(payload.callLogId)({
    status: response.status,
    data: response.data,
  });

  // publish an event so that webhook worker can call the webhooks to send signed messages
  logger.info("publishing: ", {
    ...payload,
    apiResponse: response.data,
  });
  if (!payload.webhookUrl) return;

  await webhookPublisher.publish({
    ...payload,
    apiResponse: response.data,
  });
}

registerWorker(JOB_QUEUE_NAME, callSignApi);
