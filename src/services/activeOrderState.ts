import { redis } from '../db/redis';

type ActiveOrderState = {
  status: string;
  chosenDex?: string;
  executionPrice?: number;
  txHash?: string;
  error?: string;
  updatedAt: string;
};

const ACTIVE_ORDER_TTL = 300; // 5 minutes

function key(orderId: string) {
  return `active:order:${orderId}`;
}

/**
 * Set / update active order state
 */
export async function setActiveOrderState(
  orderId: string,
  state: ActiveOrderState
) {
  await redis.set(
    key(orderId),
    JSON.stringify(state),
    'EX',
    ACTIVE_ORDER_TTL
  );

  await redis.sadd('active:orders', orderId);
}


export async function getActiveOrderState(
  orderId: string
): Promise<ActiveOrderState | null> {
  const raw = await redis.get(key(orderId));
  return raw ? JSON.parse(raw) : null;
}

export async function clearActiveOrder(orderId: string) {
  await redis.del(key(orderId));
  await redis.srem('active:orders', orderId);
}

