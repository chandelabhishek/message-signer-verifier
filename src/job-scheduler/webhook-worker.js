const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);
const { Worker } = require("bullmq");
const axios = require("axios").default;
const { connection } = require("./config");
const { WEBHOOK_QUEUE_NAME } = require("../constant");

// const getCallerService = require("../service/sign-verify-caller");

// const apiCallerService = getCallerService();

async function callWebhook(job) {
  const { payload } = job.data;
  await axios(payload.webhookUrl, {
    headers: payload.webhookHeaders,
  });
}

const worker = new Worker(WEBHOOK_QUEUE_NAME, callWebhook, { connection });

worker.on("completed", (job) => {
  console.info(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`${job.id} has failed with ${err.message}`);
});

worker.on("error", (err) => {
  // log the error
  console.error(err);
});
console.log("Worker Started ===>>>>");
