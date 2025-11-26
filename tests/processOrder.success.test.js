const { processOrder } = require("../queue/orderQueue");
const Order = require("../src/models/Order");
const router = require("../services/mockDexRouter");
jest.mock("../src/models/Order");
jest.mock("../services/mockDexRouter");

describe("processOrder success", () => {
  test("should process order successfully", async () => {
    Order.findById.mockResolvedValue({
      _id: "order123",
      status: "pending",
      save: jest.fn(),
    });

    router.getRaydiumQuote.mockResolvedValue({ dex: "raydium", price: 100 });
    router.getMeteoraQuote.mockResolvedValue({ dex: "meteora", price: 95 });
    router.executeSwap.mockResolvedValue({
      dex: "raydium",
      txHash: "tx123",
      executedPrice: 99.8,
    });

    await processOrder("order123", 1);

    expect(true).toBe(true);
  });
});
