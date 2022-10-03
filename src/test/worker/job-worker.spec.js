const callSignApi = require("../../app/worker/job-worker");
const webhookPublisher = require("../../app/service/publisher/webhook-publisher");
const makeGetApiCall = require("../../app/service/api-caller");

jest.mock("../../app/service/api-caller", () => jest.fn());

jest.mock("../../app/service/publisher/webhook-publisher", () => ({
  publish: jest.fn(),
}));

jest.mock("../../app/worker/worker");

describe("worker/job-worker.js -- should process message", () => {
  let ApiCallRepository = jest.fn(() => ({
    getOrCreateCallLog: jest.fn(),
    updateCallLogById: updateCallLogByIdMock,
  }));
  let updateCallLogByIdMock = jest.fn();
  let isOverTheLimitMock = jest.fn();
  let RateLimiter = null;

  let JobScheduler = jest.fn();
  beforeEach(() => {
    ApiCallRepository = jest.fn(() => ({
      getOrCreateCallLog: jest.fn(),
      updateCallLogById: updateCallLogByIdMock,
    }));
    isOverTheLimitMock = jest.fn(async () => false);
    RateLimiter = jest.fn(async () => ({
      isOverTheLimit: isOverTheLimitMock,
      addRequestToRateLimitWndow: jest.fn(),
    }));
    JobScheduler = jest.fn();
    updateCallLogByIdMock = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const payload = {
    callLogId: "some_call_log_id",
    message: "4236cfa7-dea1-4d5c-8e2d-cf3166af7227",
    clientRequestId: "b961d71e-894a-4200-aebc-5480a7b6c02e",
    webhookUrl: "https://1009-117-197-50-36.in.ngrok.io",
    webhookHeaders: {
      "x-auth": "ping-pong",
      "y-auth": "bing bing",
    },
  };
  const job = {
    data: { payload },
  };

  makeGetApiCall.mockImplementationOnce(async () => apiResponse);

  const apiResponse = { status: 200, data: "some_signed_message" };

  it("should call synthesia API successfully and update the db and trigger webhook worker", async () => {
    await callSignApi(ApiCallRepository, JobScheduler, RateLimiter)(job);

    expect(ApiCallRepository).toHaveBeenCalledTimes(1);
    expect(RateLimiter).toHaveBeenCalledTimes(1);
    expect(updateCallLogByIdMock).toHaveBeenCalledWith(payload.callLogId, {
      requestStatus: apiResponse.status,
      response: apiResponse.data,
    });

    expect(makeGetApiCall).toHaveBeenCalledWith(
      process.env.SIGN_URL,
      { message: payload.message },
      { timeout: 30000 }
    );
    expect(webhookPublisher.publish).toHaveBeenCalledWith({
      ...payload,
      apiResponse: apiResponse.data,
    });
  });

  it("should call not call synthesia API because of ratelimiting", async () => {
    isOverTheLimitMock = jest.fn(async () => true);
    expect(
      callSignApi(ApiCallRepository, JobScheduler, RateLimiter)(job)
    ).rejects.toThrow(Error);

    expect(ApiCallRepository).toHaveBeenCalledTimes(1);
    expect(RateLimiter).toHaveBeenCalledTimes(1);
    expect(updateCallLogByIdMock).toHaveBeenCalledTimes(0);

    expect(makeGetApiCall).toHaveBeenCalledTimes(0);
    expect(webhookPublisher.publish).toHaveBeenCalledTimes(0);
  });
});
