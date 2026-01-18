import type { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import crypto from 'crypto';
import { redis } from '../db/redis';

const socketRegistry = new Map<string, WebSocket>();

export function registerOrderWebSocket(fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, async (connection, req) => {
    const { orderId } = req.query as { orderId?: string };

    if (!orderId) {
      connection.close(1008, 'orderId is required');
      return;
    }

    const socketId = crypto.randomUUID();
    const socket = connection; // ✅ THIS IS THE SOCKET
    const redisKey = `ws:order:${orderId}`;

    socketRegistry.set(socketId, socket);
    await redis.sAdd(redisKey, socketId);

    fastify.log.info({ orderId, socketId }, 'WS subscribed');

    socket.on('close', async () => {
      socketRegistry.delete(socketId);
      await redis.sRem(redisKey, socketId);

      const remaining = await redis.sCard(redisKey);
      if (remaining === 0) {
        await redis.del(redisKey);
      }

      fastify.log.info({ orderId, socketId }, 'WS disconnected');
    });

    socket.on('message', (msg) => {
      if (msg.toString() === 'ping') {
        socket.send(JSON.stringify({ type: 'pong' }));
      }
    });
  });
}

export async function broadcastOrderUpdate(
  orderId: string,
  event: {
    status: string;
    data?: unknown;
  }
) {
  const redisKey = `ws:order:${orderId}`;
  const socketIds = await redis.sMembers(redisKey);

  for (const socketId of socketIds) {
    const socket = socketRegistry.get(socketId);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(event));
    }
  }
}
