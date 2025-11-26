# Eterna Labs – Order Execution Engine

A high-performance simulated order execution engine supporting:
- DEX routing (Raydium, Meteora)
- WebSocket real-time status streaming
- Job queue with retry logic
- Full Jest test suite with 100% passing tests
- Mocked swap execution & routing engine

## Features
- REST API: `/api/orders/execute`
- WebSocket server: `/ws?orderId=...`
- Job queue with retry & exponential backoff
- Mock DEX router with best-price selection
- Comprehensive unit + integration tests

## Folder Structure
src/
  controllers/
  events/
  models/
  queue/
  services/
  websocket/
tests/
README.md

## How to Run
npm install
npm start

## Run Tests
npm test
npm run test:coverage

## Deployment Notes
- Backend deployed on Render
- WebSockets enabled via Render services
- GitHub repo connected for CI/CD

