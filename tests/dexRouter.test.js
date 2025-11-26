const router = jest.requireActual("../services/mockDexRouter");

describe("DEX Router Logic", () => {

  test("should return Raydium quote with correct structure", async () => {
    const q = await router.getRaydiumQuote("SOL", "USDC", 1);
    expect(q).toHaveProperty("dex", "raydium");
    expect(q).toHaveProperty("price");
    expect(q).toHaveProperty("fee");
  });

  test("should return Meteora quote with correct structure", async () => {
    const q = await router.getMeteoraQuote("SOL", "USDC", 1);
    expect(q).toHaveProperty("dex", "meteora");
    expect(q).toHaveProperty("price");
    expect(q).toHaveProperty("fee");
  });

  test("should pick the highest priced DEX", () => {
    const ray = { price: 100 };
    const met = { price: 90 };
    const best = router.chooseBestDex(ray, met);
    expect(best).toBe(ray);
  });

});
