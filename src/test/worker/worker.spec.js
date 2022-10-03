const registerWorker = require("../../app/worker/worker");
const { Worker } = require("bullmq");
const { connection } = require("../../app/worker/config");

jest.mock("bullmq", () => ({
  Worker: jest.fn(),
}));

describe("worker/worker.js", () => {
  it("should return batteries included instance of bullmq worker", () => {
    const queueName = "some_queueName";
    const handler = jest.fn();
    const onMock = jest.fn();
    Worker.mockImplementationOnce((queueName, hander, { connection }) => ({
      on: onMock,
    }));
    registerWorker(queueName, handler);

    expect(Worker).toHaveBeenCalledWith(queueName, handler, { connection });
    expect(onMock).toHaveBeenCalledTimes(3);
  });
});
