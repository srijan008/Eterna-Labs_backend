const sleep = require("../utils/sleep");

describe("sleep util", () => {
  test("should delay execution", async () => {
    const start = Date.now();
    await sleep(300);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(300);
  });
});
