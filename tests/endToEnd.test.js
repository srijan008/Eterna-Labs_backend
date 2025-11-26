const request = require("supertest");
const express = require("express");
const orderRoutes = require("../src/routes/orderRoutes");
const Order = require("../src/models/Order");
const queue = require("../queue/orderQueue");

jest.mock("../src/models/Order");
jest.mock("../queue/orderQueue");

const app = express();
app.use(express.json());
app.use("/api/orders", orderRoutes);

describe("End-to-End Order Simulation", () => {
  test("should simulate a full order flow", async () => {
    Order.create.mockResolvedValue({
      _id: "order999",
      status: "pending",
    });

    const res = await request(app)
      .post("/api/orders/execute")
      .send({
        tokenIn: "SOL",
        tokenOut: "USDC",
        amount: 2,
      });

    expect(res.statusCode).toBe(202);
    expect(queue.enqueueJob).toHaveBeenCalledWith("order999");
  });
});
