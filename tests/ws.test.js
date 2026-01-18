import WebSocket from 'ws';
import { buildServerExport } from '../server.ts';
import { afterAll, beforeAll, test, expect } from 'vitest';

let server;

beforeAll(async () => {
  server = await buildServerExport();
  await server.listen({ port: 0 });
});

afterAll(async () => {
  await server.close();
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
