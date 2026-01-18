import IORedis from 'ioredis';

export const bullmqRedis = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null
});
