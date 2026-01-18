import { Worker } from 'bullmq';
import crypto from 'crypto';
import { prisma } from '../db/prisma';
import { redis } from '../db/redis';
import { ORDER_QUEUE_NAME } from '../queue/orderQueue.js';
import { MockDexRouter } from '../services/mockDexRouter.js';
import { broadcastOrderUpdate } from '../ws/order.ws.js';
import pino from 'pino';
import { bullmqRedis } from '../db/redis.bullmq.js';

const router = new MockDexRouter();
const logger = pino();

export const orderWorker = new Worker(
  ORDER_QUEUE_NAME,
  async (job) => {
    const { orderId } = job.data;
  await new Promise(res => setTimeout(res, 20000));
    logger.info({ orderId }, 'Processing order');

    try {
      // ---- PENDING → ROUTING ----
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'routing' }
      });

      await broadcastOrderUpdate(orderId, { status: 'routing' });

      // ---- FETCH QUOTES ----
      const [raydium, meteora] = await Promise.all([
        router.getRaydiumQuote(1),
        router.getMeteoraQuote(1)
      ]);

      const best =
        raydium.price > meteora.price ? raydium : meteora;

            // ---- ROUTING DECISION ----
            // ---- ROUTING DECISION ----
        await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'building',
            chosenDex: best.dex
        }
        });

        await broadcastOrderUpdate(orderId, {
        status: 'building',
        data: { chosenDex: best.dex }
        });
        logger.info({ orderId, bestDex: best.dex }, 'Best DEX selected');

        // ---- BUILDING TRANSACTION ----

        // ---- SUBMITTED ----
        await prisma.order.update({
        where: { id: orderId },
        data: { status: 'submitted' }
        });
        logger.info({ orderId }, 'Order submitted for execution');

        await broadcastOrderUpdate(orderId, {
        status: 'submitted'
        });
        logger.info({ orderId }, 'Broadcasted submitted status');

        // ---- EXECUTION ----
        const result = await router.executeSwap(
        best.dex,
        best.price,
        0.01 // 1% slippage tolerance
        );



      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'confirmed',
          executionPrice: result.executedPrice,
          txHash: result.txHash
        }
      });

      await broadcastOrderUpdate(orderId, {
        status: 'confirmed',
        data: {
          txHash: result.txHash,
          executionPrice: result.executedPrice
        }
      });
    } catch (err: any) {
      // ---- FAILURE ----
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'failed',
          failureReason: err.message
        }
      });

      await broadcastOrderUpdate(orderId, {
        status: 'failed',
        data: { error: err.message }
      });

      throw err; // let BullMQ handle retries
    }
  },
  {
    connection: bullmqRedis,
    concurrency: 10
  }
);

orderWorker.on('failed', (job, err) => {
  console.error(
    `❌ Order ${job?.data?.orderId} failed after retries`,
    err.message
  );
});
