const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);
const { Worker } = require("bullmq");

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;
const knex = require("knex")({
  client: "pg",
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
});
const webhookPublisher = require("./webhook-publisher");
const { connection } = require("./config");
const { JOB_QUEUE_NAME } = require("../constant");
const getCallerService = require("../service/sign-verify-caller");

const apiCallerService = getCallerService(knex);

async function callSignApi(job) {
  const { payload } = job.data;
  console.log(payload);
  const { status, data } = await apiCallerService.makeSignCall(payload);

  await apiCallerService.handleSignSuccessResponse(payload.callLogId)({
    status,
    data,
  });

  await webhookPublisher.publish({ ...payload, apiResponse: data });
}

const worker = new Worker(JOB_QUEUE_NAME, callSignApi, { connection });

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
