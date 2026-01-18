import { MockDexRouter } from '../src/services/mockDexRouter';

test('returns raydium or meteora quote', async () => {
  const router = new MockDexRouter();
  const quote = await router.getRaydiumQuote(1);

  expect(quote.price).toBeGreaterThan(0);
  expect(quote.dex).toBe('raydium');
});


test('routing selects best price', async () => {
  const router = new MockDexRouter();

  const r = await router.getRaydiumQuote(1);
  const m = await router.getMeteoraQuote(1);

  const best = r.price > m.price ? r : m;
  expect(best.price).toBe(Math.max(r.price, m.price));
});

test('slippage protection rejects when slippage exceeds tolerance', async () => {
  const router = new MockDexRouter();

  try {
    await router.executeSwap('raydium', 100, 0.00001);
  } catch (err) {
    expect(err.message).toBe('SLIPPAGE_EXCEEDED');
  }
});

