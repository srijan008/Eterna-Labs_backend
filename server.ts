import Fastify from 'fastify';
import websocket from '@fastify/websocket';

import { prisma } from './src/db/prisma';
import { initOrderQueue } from './queue/orderQueue';
import orderRoutes from './src/routes/orderRoutes.js';
import { registerOrderWebSocket } from './src/ws/order.ws';
import { getActiveOrderState } from './src/services/activeOrderState';

const PORT = Number(process.env.PORT) || 4000;


export async function buildServer() {
  const fastify = Fastify({ logger: true });

  await fastify.register(websocket);

  fastify.get('/', async () => {
    return { message: 'Order Execution Engine is running' };
  });

  fastify.get('/:id/status', async (req, reply) => {
    const { id } = req.params as { id: string };

    const active = await getActiveOrderState(id);
    if (active) return active;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return reply.code(404).send({ error: 'Order not found' });

    return order;
  });

  await fastify.register(orderRoutes, { prefix: '/api/orders' });
  registerOrderWebSocket(fastify);

  return fastify;
}


async function start() {
  try {
    const fastify = await buildServer();

    
    await prisma.$connect();

    
    await initOrderQueue();

    
    if (process.env.NODE_ENV !== 'test') {
      await import('./src/workers/order.worker');
    }

    await fastify.listen({ port: PORT, host: '0.0.0.0' });

    fastify.log.info(`Server running on port ${PORT}`);
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}


if (process.env.NODE_ENV !== 'test') {
  start();
}
