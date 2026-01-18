import { Queue } from 'bullmq';
import { bullmqRedis as redis } from '../db/redis.bullmq.js';
export const ORDER_QUEUE_NAME = 'order-execution';

export const orderQueue = new Queue(ORDER_QUEUE_NAME, {
    connection: redis,
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
  // console.log('Initializing order queue...');
  await orderQueue.waitUntilReady();
  console.log('Order queue initialized');
}

export async function enqueueOrder(orderId: string) {
  // console.log('ENQUEUE ORDER CALLED', orderId);
  await orderQueue.add('execute-order', { orderId });
  console.log('Order enqueued:', orderId);
}
