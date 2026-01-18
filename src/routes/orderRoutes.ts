import { FastifyInstance } from 'fastify';
import { prisma } from '../db/prisma';
import { redis } from '../db/redis.ts';
import { enqueueOrder } from '../queue/orderQueue.ts';
import crypto from 'crypto';

type ExecuteOrderBody = {
  tokenIn: string;
  tokenOut: string;
  amount: number;
  orderType?: 'market';
};

export default async function orderRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/execute',
    async (request, reply) => {
      fastify.log.info('HANDLER ENTERED');
      fastify.log.info({ body: request.body }, 'BODY');
      const body = request.body as ExecuteOrderBody;
      const { tokenIn, tokenOut, amount, orderType = 'market' } = body;

      
      if (!tokenIn || !tokenOut || amount == null) {
        return reply.code(400).send({
          error: 'tokenIn, tokenOut and amount are required'
        });
      }

      if (tokenIn === tokenOut) {
        return reply.code(400).send({
          error: 'tokenIn and tokenOut must be different'
        });
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return reply.code(400).send({
          error: 'amount must be a positive number'
        });
      }

      if (orderType !== 'market') {
        return reply.code(400).send({
          error: 'Only market orders are supported'
        });
      }

      
      const idempotencyKey =
        request.headers['idempotency-key'] as string | undefined;

      if (idempotencyKey) {
        const existingOrderId = await redis.get(
          `idempotency:${idempotencyKey}`
        );

        if (existingOrderId) {
          return reply.code(200).send({
            message: 'Order already accepted',
            orderId: existingOrderId
          });
        }
      }

      
      const orderId = crypto.randomUUID();
      fastify.log.info('BEFORE prisma.create');
      await prisma.order.create({
        data: {
          id: orderId,
          orderType,
          tokenIn,
          tokenOut,
          amount,
          status: 'pending'
        }
      });
    fastify.log.info('AFTER prisma.create');
      if (idempotencyKey) {
        await redis.set(
          `idempotency:${idempotencyKey}`,
          orderId,
          { EX: 60 * 60 }
        );
      }
      fastify.log.info('BEFORE enqueueOrder');

      enqueueOrder(orderId).catch(err => {
        fastify.log.error({ err }, 'Failed to enqueue order');
      });

      fastify.log.info('AFTER enqueueOrder');

      return reply.code(202).send({
        message: 'Order accepted and queued for execution',
        orderId
      });
    }
  );
}
