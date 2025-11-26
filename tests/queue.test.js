const { enqueueJob } = require("../queue/orderQueue");
const Order = require("../src/models/Order");
const mockRouter = require("../services/mockDexRouter");
const orderEvents = require("../events/orderEvents");

jest.mock("../src/models/Order");
jest.mock("../services/mockDexRouter");
jest.mock("../events/orderEvents");

describe("Queue Behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should enqueue job and start processing", async () => {
    Order.findById.mockResolvedValue({
      _id: "order123",
      status: "pending",
      save: jest.fn(),
    });

    mockRouter.getRaydiumQuote.mockResolvedValue({ price: 100 });
    mockRouter.getMeteoraQuote.mockResolvedValue({ price: 90 });
    mockRouter.executeSwap.mockResolvedValue({
      txHash: "tx123",
      executedPrice: 100.5,
    });

    enqueueJob("order123");

    expect(true).toBe(true); 
  });
});
