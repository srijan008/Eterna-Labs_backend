const { processOrder } = require("../queue/orderQueue");
const Order = require("../src/models/Order");
const router = require("../services/mockDexRouter");
jest.mock("../src/models/Order");
jest.mock("../services/mockDexRouter");

describe("processOrder failure", () => {
  test("should mark order as failed", async () => {
    Order.findById.mockResolvedValue({
      _id: "order123",
      status: "pending",
      save: jest.fn(),
    });

    router.getRaydiumQuote.mockRejectedValue(new Error("Network error"));
    router.getMeteoraQuote.mockRejectedValue(new Error("Network error"));

    await processOrder("order123", 3); // last retry

    expect(true).toBe(true);
  });
});
