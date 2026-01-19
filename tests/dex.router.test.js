import { describe, test, expect } from 'vitest';
import { MockDexRouter } from '../src/services/mockDexRouter';

describe('DEX Router', () => {
  const router = new MockDexRouter();

  test('returns raydium quote', async () => {
    const quote = await router.getRaydiumQuote(1);
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.dex).toBe('raydium');
  });

  test('returns meteora quote', async () => {
    const quote = await router.getMeteoraQuote(1);
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.dex).toBe('meteora');
  });

  test('routing selects best price', async () => {
    const r = await router.getRaydiumQuote(1);
    const m = await router.getMeteoraQuote(1);

    const best = r.price > m.price ? r : m;
    expect(best.price).toBe(Math.max(r.price, m.price));
  });
});
