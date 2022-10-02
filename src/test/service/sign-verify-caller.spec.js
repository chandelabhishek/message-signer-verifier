const getSignApiCaller = require("../../app/service/sign-verify-caller");
const makeGetApiCall = require("../../app/service/api-caller");
const bullMQJobScheduler = require("../../app/service/publisher/job-scheduler");
const TimeoutError = require("../../app/exception/timeout-error");
const apiCaller = require("../../app/service/api-caller");
jest.mock("../../app/service/api-caller", () => jest.fn());

describe("callSign", () => {
  const reply = {
    code: () => {
      return { send: (val) => val };
    },
  };

  const payload = {
    message: "5bb1e9b1-3eb2-4f40-a044-91024f6062ab",
    clientRequestId: "5bb1e9b1-3eb2-4f40-a044-91024f6062ab",
    webhookUrl: "http://2ed9-117-197-50-9.in.ngrok.io",
    webhookHeaders: {
      "x-auth": "ping-pong",
      "y-auth": "bing bing",
    },
  };

  let ApiCallRepo = null;

  let RateLimiter = null;
  const jobScheduler = { publish: jest.fn() };
  const constantDate = new Date("2017-06-13T04:41:20");
  beforeEach(() => {
    ApiCallRepo = {
      getOrCreateCallLog: jest.fn(async () => ({
        requestStatus: null,
        id: "some_id",
        response: null,
        retryScheduled: false,
      })),
      updateCallLogById: jest.fn(async () => {}),
    };
    RateLimiter = {
      isOverTheLimit: jest.fn(async () => {}),
      addRequestToRateLimitWndow: jest.fn(async () => {}),
    };

    /*eslint no-global-assign:off*/
    Date = class extends Date {
      constructor() {
        return constantDate;
      }
    };
  });
  it("should call synthesia api and return signed message", async () => {
    apiCaller.mockImplementationOnce(async () => ({
      data: "signed message",
      status: 200,
    }));
    const signApiCallerService = await getSignApiCaller(
      ApiCallRepo,
      jobScheduler,
      RateLimiter
    );

    const resp = await signApiCallerService.callSign(reply, payload);
    expect(ApiCallRepo.getOrCreateCallLog).toHaveBeenCalledWith(payload);
    expect(makeGetApiCall).toHaveBeenCalledWith(
      process.env.SIGN_URL,
      {
        message: payload.message,
      },
      {}
    );
    expect(ApiCallRepo.updateCallLogById).toHaveBeenCalledWith("some_id", {
      requestStatus: 200,
      response: "signed message",
    });
    expect(resp).toBe("signed message");
  });

  it("should accept the request when synthesia api takes more than 1900s", async () => {
    apiCaller.mockImplementationOnce(() => {
      throw new TimeoutError();
    });

    const signApiCallerService = await getSignApiCaller(
      ApiCallRepo,
      jobScheduler,
      RateLimiter
    );

    const resp = await signApiCallerService.callSign(reply, payload);
    expect(ApiCallRepo.getOrCreateCallLog).toHaveBeenCalledWith(payload);
    expect(makeGetApiCall).toHaveBeenCalledWith(
      process.env.SIGN_URL,
      {
        message: payload.message,
      },
      {}
    );
    expect(ApiCallRepo.updateCallLogById).toHaveBeenCalledWith("some_id", {
      retryScheduled: true,
      updatedAt: constantDate,
    });
    expect(resp).toBe("ACCEPTED");
  });

  it("should accept the request when synthesia api throws 502", async () => {
    apiCaller.mockImplementationOnce(() => {
      throw new TimeoutError();
    });

    const signApiCallerService = await getSignApiCaller(
      ApiCallRepo,
      jobScheduler,
      RateLimiter
    );

    const resp = await signApiCallerService.callSign(reply, payload);
    expect(ApiCallRepo.getOrCreateCallLog).toHaveBeenCalledWith(payload);
    expect(makeGetApiCall).toHaveBeenCalledWith(
      process.env.SIGN_URL,
      {
        message: payload.message,
      },
      {}
    );
    expect(ApiCallRepo.updateCallLogById).toHaveBeenCalledWith("some_id", {
      retryScheduled: true,
      updatedAt: constantDate,
    });
    expect(resp).toBe("ACCEPTED");
  });

  it("should accept the request when synthesia api cannot be called because of rate limiter", async () => {
    RateLimiter.isOverTheLimit = jest
      .fn()
      .mockImplementationOnce(async () => true);
    const signApiCallerService = await getSignApiCaller(
      ApiCallRepo,
      jobScheduler,
      RateLimiter
    );

    const resp = await signApiCallerService.callSign(reply, payload);
    expect(ApiCallRepo.getOrCreateCallLog).toHaveBeenCalledWith(payload);
    expect(makeGetApiCall).toHaveBeenCalledWith(
      process.env.SIGN_URL,
      {
        message: payload.message,
      },
      {}
    );
    expect(ApiCallRepo.updateCallLogById).toHaveBeenCalledWith("some_id", {
      retryScheduled: true,
      updatedAt: constantDate,
    });
    expect(resp).toBe("ACCEPTED");
  });
});
