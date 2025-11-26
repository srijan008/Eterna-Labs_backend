const Order = require('../src/models/Order');
const mockDexRouter = require('../services/mockDexRouter');
const orderEvents = require('../events/orderEvents');
const sleep = require('../utils/sleep');

const { activeWebSockets } = require("../websocket/wsServer");
const MAX_CONCURRENCY = 10;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000; 
const MAX_ORDERS_PER_MINUTE = 100;


const jobQueue = [];
let activeCount = 0;
let initialized = false;

const processedTimestamps = [];

function recordProcessed() {
  const now = Date.now();
  processedTimestamps.push(now);

  
  const oneMinuteAgo = now - 60 * 1000;
  while (processedTimestamps.length && processedTimestamps[0] < oneMinuteAgo) {
    processedTimestamps.shift();
  }
}

function canProcessMoreNow() {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  const recent = processedTimestamps.filter((t) => t >= oneMinuteAgo).length;
  return recent < MAX_ORDERS_PER_MINUTE;
}

async function updateOrderStatus(orderId, status, details = {}) {
    console.log("🔄 updateOrderStatus called:", orderId, status);

  const order = await Order.findById(orderId);
  if (!order) {
    console.warn('Order not found while updating status:', orderId);
    return;
  }

  order.status = status;
  order.statusHistory.push({ status, details, timestamp: new Date() });

  if (details.routedDex) order.routedDex = details.routedDex;
  if (details.quotes) order.quotes = details.quotes;
  if (details.executedPrice != null)
    order.executedPrice = details.executedPrice;
  if (details.txHash) order.txHash = details.txHash;
  if (details.failureReason) order.failureReason = details.failureReason;

  await order.save();

    console.log("📢 EMITTING WS EVENT:", orderId, status);


  orderEvents.emit('status', {
    orderId: order._id.toString(),
    status,
    details
  });
}

async function processOrder(orderId, attempt = 1) {
  console.log(" Waiting for WebSocket client to connect for:", orderId);
  if (process.env.NODE_ENV === "test") {
    console.log("[TEST MODE] Skipping WebSocket wait");
    return;
  }

  while (!activeWebSockets.has(orderId)) {
    await sleep(500);
    console.log("...still waiting for WebSocket for order:", orderId);
  }

  console.log(" WebSocket connected. Starting processing for:", orderId);

      await sleep(1000); 
    
    
console.log("⏳ Waiting for WebSocket connection for order:", orderId);

while (!activeWebSockets.has(orderId)) {
  await sleep(500);
  console.log("... still waiting for WebSocket ...");
}

console.log("✅ WebSocket connected — starting order processing");


  try {
    await updateOrderStatus(orderId, 'routing', {
      attempt
    });

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found in processOrder');
    }

    const { tokenIn, tokenOut, amount } = order;

    
    const [raydiumQuote, meteoraQuote] = await Promise.all([
      mockDexRouter.getRaydiumQuote(tokenIn, tokenOut, amount),
      mockDexRouter.getMeteoraQuote(tokenIn, tokenOut, amount)
    ]);

    const bestQuote = mockDexRouter.chooseBestDex(
      raydiumQuote,
      meteoraQuote
    );

    if (!bestQuote) {
      throw new Error('No quotes available from any DEX');
    }

    await updateOrderStatus(orderId, 'routing', {
      attempt,
      quotes: {
        raydium: raydiumQuote,
        meteora: meteoraQuote
      },
      routedDex: bestQuote.dex
    });

    
    await updateOrderStatus(orderId, 'building', {
      routedDex: bestQuote.dex
    });

    
    await sleep(300);

    
    await updateOrderStatus(orderId, 'submitted', {
      routedDex: bestQuote.dex
    });

    
    const result = await mockDexRouter.executeSwap(
      bestQuote.dex,
      order,
      bestQuote.price
    );

    
    const slippage =
      Math.abs(result.executedPrice - bestQuote.price) / bestQuote.price;

    const MAX_SLIPPAGE = 0.02; 
    if (slippage > MAX_SLIPPAGE) {
      throw new Error(
        `Slippage too high: ${(slippage * 100).toFixed(2)}%`
      );
    }

    
    await updateOrderStatus(orderId, 'confirmed', {
      routedDex: bestQuote.dex,
      executedPrice: result.executedPrice,
      txHash: result.txHash
    });

    recordProcessed();
  } catch (err) {
    console.error(
      ` Error processing order ${orderId} (attempt ${attempt}):`,
      err.message
    );

    if (attempt < MAX_RETRIES) {
      
      const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(
        ` Retrying order ${orderId} in ${delay}ms (attempt ${
          attempt + 1
        })`
      );
      setTimeout(() => {
        enqueueJob(orderId, attempt + 1);
      }, delay);
    } else {
      await updateOrderStatus(orderId, 'failed', {
        failureReason: err.message
      });
      recordProcessed();
    }
  } finally {
    activeCount--;
    processNext(); 
  }
}

function processNext() {
  if (activeCount >= MAX_CONCURRENCY) return;
  if (jobQueue.length === 0) return;

  if (!canProcessMoreNow()) {
    setTimeout(processNext, 1000);
    return;
  }

  const job = jobQueue.shift();
  if (!job) return;

  activeCount++;

  processOrder(job.orderId, job.attempt).catch((err) => {
    console.error('Unexpected error in processOrder:', err);
  });
}


function enqueueJob(orderId, attempt = 1) {
    console.log(" Job added to queue:", orderId);
  jobQueue.push({ orderId, attempt });
  

  processNext();
}

function initOrderQueue() {
  if (initialized) return;
  initialized = true;
  console.log('Order queue initialized');
}

module.exports = {
  initOrderQueue,
  processOrder,
  enqueueJob
};
