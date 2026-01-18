// import request from 'supertest';
// import { buildServerExport } from '../server.ts';

// let app;
  
// beforeAll(async () => {
//   app = await buildServerExport();
// });

// test('creates market order successfully', async () => {
//   const res = await request(app.server)
//     .post('/api/orders/execute')
//     .send({
//       tokenIn: 'SOL',
//       tokenOut: 'USDC',
//       amount: 10
//     });

//   expect(res.status).toBe(202);
//   expect(res.body.orderId).toBeDefined();
// });

// test('rejects invalid amount', async () => {
//   const res = await request(app.server)
//     .post('/api/orders/execute')
//     .send({
//       tokenIn: 'SOL',
//       tokenOut: 'USDC',
//       amount: -1
//     });

//   expect(res.status).toBe(400);
// });

// test('rejects same token swap', async () => {
//   const res = await request(app.server)
//     .post('/api/orders/execute')
//     .send({
//       tokenIn: 'SOL',
//       tokenOut: 'SOL',
//       amount: 5
//     });

//   expect(res.status).toBe(400);
// });

// test('idempotency returns same orderId', async () => {
//   const key = 'test-idempotency-key';

//   const r1 = await request(app.server)
//     .post('/api/orders/execute')
//     .set('Idempotency-Key', key)
//     .send({
//       tokenIn: 'SOL',
//       tokenOut: 'USDC',
//       amount: 1
//     });

//   const r2 = await request(app.server)
//     .post('/api/orders/execute')
//     .set('Idempotency-Key', key)
//     .send({
//       tokenIn: 'SOL',
//       tokenOut: 'USDC',
//       amount: 1
//     });

//   expect(r1.body.orderId).toBe(r2.body.orderId);
// });
