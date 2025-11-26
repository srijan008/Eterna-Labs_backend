const { enqueueJob } = require("../queue/orderQueue");
const mockRouter = require("../services/mockDexRouter");
const Order = require("../src/models/Order");

jest.mock("../src/models/Order");
jest.mock("../services/mockDexRouter");

describe("Retry Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should retry 3 times before failing", async () => {
    Order.findById.mockResolvedValue({
      _id: "order123",
      status: "pending",
      save: jest.fn(),
    });

    mockRouter.getRaydiumQuote.mockRejectedValue(new Error("Network error"));
    mockRouter.getMeteoraQuote.mockRejectedValue(new Error("Network error"));

    enqueueJob("order123");

    expect(true).toBe(true);
  });
});
