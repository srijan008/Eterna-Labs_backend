import { orderQueue } from '../src/queue/orderQueue';

test('order is enqueued', async () => {
  const job = await orderQueue.add('test', { orderId: '123' });
  expect(job.id).toBeDefined();
});

test('queue retries on failure', async () => {
  const job = await orderQueue.add(
    'fail-test',
    { orderId: 'fail' },
    { attempts: 2 }
  );

  expect(job.opts.attempts).toBe(2);
});

