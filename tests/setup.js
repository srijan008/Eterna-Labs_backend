import { prisma } from '../src/db/prisma';
import { redis } from '../src/db/redis';

beforeAll(async () => {
  await prisma.$connect();
});

afterEach(async () => {
  await prisma.order.deleteMany();
  await redis.flushAll();
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});
