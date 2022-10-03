const { default: axios } = require("axios");
const WebhookResponseUpdaterService = require("../../app/service/update-webhook-status");
const callWebhook = require("../../app/worker/webhook-worker");

jest.mock("../../app/worker/worker");
jest.mock("../../app/service/update-webhook-status", () =>
  jest.fn(() => ({
    updateWebhookResponse: jest.fn(),
  }))
);
jest.mock("axios", () => ({
  default: jest.fn(async () => ({
    data: "called",
    status: "200",
  })),
}));

describe("worker/webhook-worker.js -- should process message", () => {
  const updateWebhookResponseMock = jest.fn();

  it("should call synthesia API successfully and update the db and trigger webhook worker", async () => {
    // console.log(require("../../app/service/update-webhook-status")());
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

    const apiResponse = {
      data: "called",
      status: "200",
    };

    const axiosExpectedCalledWith = {
      method: "POST",
      data: {
        signedMessage: payload.apiResponse,
        ciientRequestId: payload.clientRequestId,
        message: payload.message,
      },
      headers: payload.webhookHeaders,
    };

    await callWebhook(job);

    expect(axios).toHaveBeenCalledWith(
      payload.webhookUrl,
      axiosExpectedCalledWith
    );

    expect(
      WebhookResponseUpdaterService.mock.results[0].value.updateWebhookResponse
    ).toHaveBeenCalledWith({
      apiCallLogId: payload.callLogId,
      lastCallResponse: apiResponse.data,
      lastCallResponseStatus: apiResponse.status,
    });
  });
});
