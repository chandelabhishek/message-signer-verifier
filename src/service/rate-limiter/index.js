// write scope
const { createClient } = require("redis");
const { v4 } = require("uuid");

const { REDIS_URL, RATE_LIMITER_WINDOW, RATE_LIMITER_MAX_ALLOWED_REQUESTS } =
  process.env;

const key = "sign-api";

const slidingWindow = parseInt(RATE_LIMITER_WINDOW, 10);
const maxRequests = parseInt(RATE_LIMITER_MAX_ALLOWED_REQUESTS, 10);
const redis = createClient({ url: REDIS_URL });
let isConnected = false;

/**
 *
 * @returns boolean -- true/false based on if synthesia sign api can be called
 */
async function isOverTheLimit() {
  const currentTime = await redis.time();
  // eslint-disable-next-line no-unused-vars
  const [_, cardinality] = await redis
    .multi()
    .zRemRangeByScore(key, 0, currentTime - slidingWindow)
    .zCard(key)
    .expire(key, Math.floor(slidingWindow / 1000))
    .exec();

  if (cardinality >= maxRequests) return true;

  return false;
}

/**
 * Increases the count of the request in the given window
 */
async function addRequestToRateLimitWndow() {
  const currentTime = await redis.time();
  await redis.zAdd(key, {
    score: currentTime.getTime(),
    value: `${v4()}`,
  });
}

function closeRedisConnection() {
  redis.quit();
}

async function getRateLimiter() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
}

getRateLimiter();

process.on("cleanup", () => closeRedisConnection());

module.exports = { isOverTheLimit, addRequestToRateLimitWndow };
