const request = require("supertest");
const express = require("express");
const orderRoutes = require("../src/routes/orderRoutes");
const Order = require("../src/models/Order");

// Mock queue
jest.mock("../queue/orderQueue", () => ({
  enqueueJob: jest.fn(),
}));

const { enqueueJob } = require("../queue/orderQueue");

const app = express();
app.use(express.json());
app.use("/api/orders", orderRoutes);

describe("POST /api/orders/execute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if required fields missing", async () => {
    const res = await request(app)
      .post("/api/orders/execute")
      .send({ tokenIn: "SOL" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("should create order and return orderId", async () => {
    // Mock DB insert
    Order.create.mockResolvedValue({
      _id: "mockOrder12345",
      status: "pending",
    });

    const res = await request(app)
      .post("/api/orders/execute")
      .send({
        tokenIn: "SOL",
        tokenOut: "USDC",
        amount: 1.5,
      });

    expect(res.statusCode).toBe(202);
    expect(res.body).toHaveProperty("orderId");

    // Confirm DB was called
    expect(Order.create).toHaveBeenCalledTimes(1);

    // Confirm queue received job
    expect(enqueueJob).toHaveBeenCalledWith("mockOrder12345");
  });

  test("should return 500 on DB error", async () => {
    Order.create.mockRejectedValue(new Error("DB Failure"));

    const res = await request(app)
      .post("/api/orders/execute")
      .send({
        tokenIn: "SOL",
        tokenOut: "USDC",
        amount: 2,
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });
});
