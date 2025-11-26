// src/controllers/orderController.js

const Order = require('../src/models/Order');
const { enqueueJob } = require('../queue/orderQueue');


const SUPPORTED_ORDER_TYPE = 'market';

async function executeOrder(req, res) {
  try {
    const { tokenIn, tokenOut, amount, orderType } = req.body;

    
    if (!tokenIn || !tokenOut || amount == null) {
      return res.status(400).json({
        error:
          'tokenIn, tokenOut and amount are required fields in the request body'
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res
        .status(400)
        .json({ error: 'amount must be a positive number' });
    }

    
    const chosenOrderType = orderType || SUPPORTED_ORDER_TYPE;
    if (chosenOrderType !== SUPPORTED_ORDER_TYPE) {
      return res.status(400).json({
        error: `Only "${SUPPORTED_ORDER_TYPE}" order type is supported in this mock implementation`
      });
    }

    
    const order = await Order.create({
      orderType: chosenOrderType,
      tokenIn,
      tokenOut,
      amount,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          details: { message: 'Order received' }
        }
      ]
    });

    const orderId = order._id.toString();

    
    console.log(" Enqueued job for:", orderId);
    enqueueJob(orderId);


    
    return res.status(202).json({
      message: 'Order accepted and queued for execution',
      orderId
    });
  } catch (err) {
    console.error('Error in executeOrder controller:', err);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: err.message });
  }
}

module.exports = {
  executeOrder
};
