
Eterna Labs – Order Execution Engine (Backend)

A real-time Market Order Execution Engine with:
- DEX Routing (Raydium vs Meteora)
- WebSocket Live Status Updates
- Concurrent Queue Processing
- MongoDB Persistence
- Mock on-chain execution
- Deployed on Render

Why Market Order?
I chose Market Order because:
- It is the simplest and closest to real DEX usage.
- It demonstrates the full order flow end-to-end instantly.
- Market orders always execute immediately at the best current price — perfect for mock DEX routing.

How to Extend to Other Order Types
Limit Order
- Add targetPrice in request.
- Processor will poll quotes every few seconds until currentPrice >= targetPrice.
- Then execute same flow as Market Order.

Sniper Order
- Wait for token launch / liquidity added.
- Detect new pool on Raydium/Meteora.
- When pool detected → auto-execute market order.

Features
Order Lifecycle (via WebSocket)
pending → routing → building → submitted → confirmed

DEX Routing
Simulated quotes:
- Raydium
- Meteora
Routes order to the best priced DEX.

Queue System
- Up to 10 concurrent orders
- 100 orders/min limit
- 3 retry attempts (with backoff)
- Logs every step

WebSocket Server
/ws?orderId=<id> streams live updates.

Deployment
Backend: https://eterna-labs-backend-69zf.onrender.com/

API Usage
POST /api/orders/execute
{
  "tokenIn": "SOL",
  "tokenOut": "USDC",
  "amount": 1.5
}

WebSocket:
wss://eterna-labs-backend-69zf.onrender.com/ws?orderId=<id>

Project Structure
src/
  controllers/
  websocket/
  queue/
  services/
  models/
  utils/
  events/

Architecture
Client → POST /execute → MongoDB
Client → WS connect → status streaming
Queue → Router → Swap → WebSocket updates


