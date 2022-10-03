// const getServer = require("../app/api-server");
const getController = require("../app/controller");
const signService = require("../app/service/sign-verify-caller");

jest.mock("../app/service/sign-verify-caller", () => jest.fn(async () => {}));
jest.mock("../app/service/rate-limiter", () => jest.fn(async () => {}));

describe("testing controller", () => {
  it("should return signController and initialize sign Services", async () => {
    await getController();
    expect(signService).toHaveBeenCalled();
  });
});
