const { StatusCodes } = require("http-status-codes");
const axios = require("axios").default;

const TimeoutError = require("../exception/timeout-error");

const { API_KEY, BASE_URL, API_TIMEOUT } = process.env;
const BadGatewayError = require("../exception/bad-gateway-error");

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: parseInt(API_TIMEOUT, 10),
  headers: {
    Authorization: API_KEY,
  },
});

async function makeGetApiCall(url, params, options = {}) {
  try {
    const response = await axiosInstance.get(url, {
      params,
      ...options,
    });
    return response;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new TimeoutError();
    }
    if (error.response?.status === StatusCodes.BAD_GATEWAY) {
      throw new BadGatewayError();
    }
    throw error;
  }
}

module.exports = makeGetApiCall;
