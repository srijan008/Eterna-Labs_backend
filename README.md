# 🚀 Order Execution Engine

## 🌐 Live Deployment

- **Base URL:**  
  https://eterna-labs-backend-1.onrender.com

- **Order Execution API (POST):**  
  https://eterna-labs-backend-1.onrender.com/api/orders/execute

- **WebSocket Endpoint:**  
  `wss://eterna-labs-backend-1.onrender.com/ws?orderId=<ORDER_ID>`

---

## 📌 Overview

This project is a **market order execution engine** that routes orders between two DEXs (Raydium and Meteora), processes them using a Redis-backed queue, and streams **real-time execution updates** to clients via WebSockets.

The implementation focuses on **system architecture**, **DEX routing logic**, **concurrent processing**, and **real-time communication**.

---

## ✅ Chosen Order Type: Market Order

**Why Market Orders?**  
Market orders best demonstrate real-time execution, queue-based processing, and WebSocket-driven status updates.

**Extending to other order types:**
- **Limit Orders:** Add a price watcher before execution.
- **Sniper Orders:** Trigger execution on token launch or liquidity events.

---

## 🔁 Order Execution Flow

1. Client submits an order via HTTP
2. API validates request and checks idempotency
3. Order is stored in PostgreSQL
4. Order is enqueued using BullMQ
5. Worker processes the order:
   - Fetches Raydium & Meteora quotes
   - Selects best price
   - Builds and executes swap (mock)
   - Applies slippage protection
6. Order status updates are streamed via WebSocket

---

## 📡 API Usage

### ➤ Create Order

**POST**
/api/orders/execute


**Request Body**
```json
{
  "tokenIn": "SOL",
  "tokenOut": "USDC",
  "amount": 14
}


Optional Headers
idempotency-key: <unique-key>

Response

{
  "orderId": "uuid"
}

🔌 WebSocket Connection


Connect using the returned orderId:

wss://eterna-labs-backend-1.onrender.com/ws?orderId=<ORDER_ID>
```
Order Lifecycle Events

pending
routing
building
submitted

confirmed (includes txHash & executionPrice)

failed (includes error reason)

Multiple clients can subscribe to the same order.

🔀 DEX Routing
Quotes fetched from Raydium and Meteora
Best execution price selected automatically
Routing decisions logged for transparency

🛡️ Slippage Protection
Execution price drift is simulated
If slippage exceeds tolerance, order fails with:
SLIPPAGE_EXCEEDED
⚙️ Queue & Concurrency
BullMQ + Redis
Concurrency: 10
Handles high request volume
Exponential backoff retries (max 3 attempts)

🔗 WebSocket Architecture
Socket IDs mapped to orderId in Redis
Status updates broadcast to all subscribed sockets
Automatic cleanup on socket disconnect

🧪 Testing
Includes 10+ unit and integration tests covering:
DEX routing logic
Slippage handling
Queue behavior and retries
API validation
WebSocket lifecycle

Run tests:
npm test

🛠 Tech Stack
Node.js + TypeScript
Fastify (HTTP + WebSocket)
BullMQ + Redis
PostgreSQL + Prisma

Vitest

🚀 Local Setup
npm install
redis-server
npx prisma migrate dev
npm run dev

🎥 Demo
The demo video shows: https://youtu.be/RMlMbygVPVk

Multiple simultaneous orders
Live WebSocket updates
DEX routing decisions
Queue concurrency handling

📌 Summary

This project demonstrates a production-grade backend architecture with:
Real-time order execution
Concurrent job processing
Robust error handling
Scalable WebSocket design
Mock execution is used to emphasize system design, with a clear path to real Solana devnet execution.

