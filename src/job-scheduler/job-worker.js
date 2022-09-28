require("dotenv").config();
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

const { connection } = require("./config");
const { QUEUE_NAME } = require("../constant");
const getCallerService = require("../service/sign-verify-caller");
const getApiCallLogRepository = require("../repository/api-call-log");

const apiCallLogRepository = getApiCallLogRepository(knex);
const apiCallerService = getCallerService(apiCallLogRepository);

async function callSignApi(job) {
  const { payload } = job.data;
  console.log(payload);
  const { status, data } = await apiCallerService.makeSignCall(payload);

  await apiCallerService.handleSignSuccessResponse(payload.callLogId)({
    status,
    data,
  });
}

const worker = new Worker(QUEUE_NAME, callSignApi, { connection });

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
