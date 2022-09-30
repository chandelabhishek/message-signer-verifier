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
    delay: parseInt(REDIS_JOB_INITIAL_DELAY, 10),
    ...jobQueueRetryConfig,
  },
  webhookEventConfig: {
    ...webhookEventRetryConfig,
  },
};
