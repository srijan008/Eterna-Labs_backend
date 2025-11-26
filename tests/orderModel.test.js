const Order = require("../src/models/Order");

describe("Order Model", () => {
  test("should create order schema fields", () => {
    const order = new Order({
      tokenIn: "SOL",
      tokenOut: "USDC",
      amount: 1,
    });

    expect(order.tokenIn).toBe("SOL");
    expect(order.tokenOut).toBe("USDC");
    expect(order.amount).toBe(1);
    expect(order.status).toBe("pending");
  });
});
