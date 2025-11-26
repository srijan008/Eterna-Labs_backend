const orderEvents = require("../events/orderEvents");
const WebSocket = require("ws");

jest.mock("ws");

describe("WebSocket Event Emission", () => {
  test("should emit event when order status updates", () => {
    const handler = jest.fn();
    orderEvents.on("status", handler);

    orderEvents.emit("status", {
      orderId: "abc",
      status: "routing",
    });

    expect(handler).toHaveBeenCalled();
  });
});
