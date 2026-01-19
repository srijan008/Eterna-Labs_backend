import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildServer } from '../server.ts';

let app;
let request;

beforeAll(async () => {
  app = await buildServer();
  await app.listen({ port: 0 });
  request = supertest(app.server);
});

afterAll(async () => {
  await app.close();
});

describe('Order API', () => {
  test('creates market order', async () => {
    const res = await request
      .post('/api/orders/execute')
      .send({
        tokenIn: 'SOL',
        tokenOut: 'USDC',
        amount: 1
      });

    expect(res.status).toBe(202);
    expect(res.body.orderId).toBeDefined();
  });

  test('rejects invalid order', async () => {
    const res = await request
      .post('/api/orders/execute')
      .send({
        tokenIn: 'SOL',
        tokenOut: 'SOL',
        amount: 1
      });

    expect(res.status).toBe(400);
  });
});
