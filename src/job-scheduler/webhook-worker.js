const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);
const { Worker } = require("bullmq");
const logger = require("pino")();

const axios = require("axios").default;
const { connection } = require("./config");
const { WEBHOOK_QUEUE_NAME } = require("../constant");

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

const worker = new Worker(WEBHOOK_QUEUE_NAME, callWebhook, { connection });

worker.on("completed", (job) => {
  logger.info(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  logger.error(`${job.id} has failed with ${err.message}`);
});

worker.on("error", (err) => {
  // log the error
  logger.error(err);
});
logger.info(
  "==============================================   WEBHOOK-WORKER  STARTED!!!!  ================================================="
);
