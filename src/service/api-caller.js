const { API_KEY, BASE_URL, API_TIMEOUT } = process.env;
const axios = require("axios").default;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: parseInt(API_TIMEOUT, 10),
  headers: {
    Authorization: API_KEY,
  },
});

function makeGetApiCall(url, params) {
  return axiosInstance.get(url, {
    params,
  });
}

module.exports = makeGetApiCall;
