import { Queue } from 'bullmq';
import { redis } from '../src/db/redis';

export const ORDER_QUEUE_NAME = 'order-execution';

export const orderQueue = new Queue(ORDER_QUEUE_NAME, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

export async function initOrderQueue() {
  await orderQueue.waitUntilReady();
  console.log('✅ Order queue initialized');
}

export async function enqueueOrder(orderId: string) {
  await orderQueue.add('execute-order', { orderId });
}
