import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { Queue, Worker, QueueEvents } from 'bullmq';

const QUEUE_NAME = 'test-order-queue';

let queue;
let worker;
let events;

beforeAll(async () => {
  const connection = { host: '127.0.0.1', port: 6379 };

  queue = new Queue(QUEUE_NAME, { connection });

  events = new QueueEvents(QUEUE_NAME, { connection });

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      if (job.name === 'fail') {
        throw new Error('FAIL');
      }
      return { ok: true };
    },
    { connection }
  );
});

afterAll(async () => {
  await worker.close();
  await events.close();
  await queue.close();
});

describe('Order Queue', () => {
  test('order is enqueued', async () => {
    const job = await queue.add('order', { id: 1 });
    expect(job.id).toBeDefined();
  });

  test(
    'queue processes jobs',
    async () => {
      const job = await queue.add('order', { id: 2 });
      const result = await job.waitUntilFinished(events);

      expect(result).toEqual({ ok: true });
    },
    5000
  );

  test(
  'queue retries on failure',
  async () => {
    const job = await queue.add(
      'fail',
      {},
      { attempts: 3, backoff: { type: 'exponential', delay: 100 } }
    );

    await expect(
      job.waitUntilFinished(events)
    ).rejects.toThrow();

    const failedJob = await queue.getJob(job.id);
    expect(failedJob.attemptsMade).toBe(3);
  },
  7000
);

});
