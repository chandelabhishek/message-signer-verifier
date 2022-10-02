const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const axios = require("axios").default;
const registerWorker = require("./worker");
const { WEBHOOK_QUEUE_NAME } = require("../constant");
const logger = require("../logger");

const WebhookResponseUpdaterService =
  require("../service/update-webhook-status")();

/**
 *
 * @param {*} job
 *
 * webhook worker job handler
 */
async function callWebhook(job) {
  const { payload } = job.data;

  logger.info(`payload to process for job: ${job.id}`, payload);

  // call webhookUrl with signed message
  const { data, status } = await axios(payload.webhookUrl, {
    method: "POST",
    data: {
      signedMessage: payload.apiResponse,
      ciientRequestId: payload.clientRequestId,
      message: payload.message,
    },
    headers: payload.webhookHeaders,
  });

  logger.info("response from synthesia api", status);
  // update the db with webhook response
  await WebhookResponseUpdaterService.updateWebhookResponse({
    apiCallLogId: payload.callLogId,
    lastCallResponse: data,
    lastCallResponseStatus: status,
  });
}

registerWorker(WEBHOOK_QUEUE_NAME, callWebhook);
