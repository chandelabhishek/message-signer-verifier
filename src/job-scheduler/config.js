const { REDIS_HOST, REDIS_PORT } = process.env;
const {
  REDIS_JOB_INITIAL_DELAY,
  REDIS_JOB_RETRY_OPTION,
  REDIS_JOB_BACKOFF_ATTEMPTS,
  REDIS_JOB_BACKOFF_DELAY,
  REDIS_WEBHOOK_EVENT_BACKOFF_ATTEMPTS,
  REDIS_WEBHOOK_EVENT_RETRY_OPTION,
  REDIS_WEBHOOK_EVENT_BACKOFF_DELAY,
} = process.env;

function generateRandomInteger(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

const jobQueueRetryConfig = {
  attempts: parseInt(REDIS_JOB_BACKOFF_ATTEMPTS, 10),
  backoff: {
    type: REDIS_JOB_RETRY_OPTION,
    delay: parseInt(REDIS_JOB_BACKOFF_DELAY, 10),
  },
};

const webhookEventRetryConfig = {
  attempts: parseInt(REDIS_WEBHOOK_EVENT_BACKOFF_ATTEMPTS, 10),
  backoff: {
    type: REDIS_WEBHOOK_EVENT_RETRY_OPTION,
    delay: parseInt(REDIS_WEBHOOK_EVENT_BACKOFF_DELAY, 10),
  },
};

module.exports = {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
  jobQueueConfig: {
    // generating random initial delay so that all the queued don't get retried at the same time
    delay: generateRandomInteger(1, 10) * parseInt(REDIS_JOB_INITIAL_DELAY, 10),
    ...jobQueueRetryConfig,
  },
  webhookEventConfig: {
    ...webhookEventRetryConfig,
  },
};
