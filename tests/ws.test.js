import WebSocket from 'ws';
import { buildServer } from '../server.ts';
import { afterAll, beforeAll, test, expect } from 'vitest';

let server;

beforeAll(async () => {
  server = await buildServer();
  await server.listen({ port: 0 });
});

afterAll(async () => {
  if (server) {
    await server.close();
  }
});


test('ws rejects connection without orderId', async () => {
  await new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${server.server.address().port}/ws`);

    ws.on('close', (code) => {
      expect(code).toBe(1008);
      resolve();
    });
  });
});
