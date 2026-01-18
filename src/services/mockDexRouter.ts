const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateMockTxHash = () => {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

export class MockDexRouter {
  private lastQuote: number | null = null;
  private basePrice: number = 100; // Initialize with a default price

  async getRaydiumQuote(amount: number) {
    await sleep(200);

    const price = this.basePrice * (0.98 + Math.random() * 0.02);
    this.lastQuote = price;

    return { dex: 'raydium', price, fee: 0.003 };
  }

  async getMeteoraQuote(amount: number) {
    await sleep(200);

    const price = this.basePrice * (0.97 + Math.random() * 0.02);
    this.lastQuote = price;

    return { dex: 'meteora', price, fee: 0.002 };
  }

  async executeSwap(
    dex: string,
    quotedPrice: number,
    slippageTolerance: number
  ) {
    await sleep(2000);

    
    const executionDrift = 1 + (Math.random() * 2 - 1) * slippageTolerance * 0.5;
    const executedPrice = quotedPrice * executionDrift;

    const slippage =
      Math.abs(executedPrice - quotedPrice) / quotedPrice;

    if (slippage > slippageTolerance) {
      throw new Error('SLIPPAGE_EXCEEDED');
    }

    return {
      txHash: generateMockTxHash(),
      executedPrice
    };
  }
}
