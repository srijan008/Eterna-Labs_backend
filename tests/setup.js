jest.mock("ws");

jest.mock("../events/orderEvents", () => {
  const EventEmitter = require("events");
  return new EventEmitter();
});

jest.mock("../src/models/Order", () => {
  function MockOrder(data) {
    Object.assign(this, data);
    this.status = data.status || "pending"; 
  }

  MockOrder.create = jest.fn();
  MockOrder.findById = jest.fn();
  MockOrder.findByIdAndUpdate = jest.fn();

  return MockOrder;
});




jest.mock("../queue/orderQueue", () => ({
  enqueueJob: jest.fn(),
  processOrder: jest.fn()  
}));

afterAll(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});
jest.mock("../services/mockDexRouter", () => {
  const fn = (v) => jest.fn().mockResolvedValue(v);

  return {
    getRaydiumQuote: fn({ dex: "raydium", price: 100, fee: 0.003 }),
    getMeteoraQuote: fn({ dex: "meteora", price: 95, fee: 0.002 }),
    executeSwap: fn({ 
      dex: "raydium",
      txHash: "tx123",
      executedPrice: 99.8
    }),
    chooseBestDex: jest.fn((a, b) => a), 
  };
});
