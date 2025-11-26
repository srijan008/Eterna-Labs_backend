
const { randomUUID } = require('crypto');
const sleep = require('../utils/sleep');

const BASE_PRICE = 100;

class MockDexRouter {
  async getRaydiumQuote(tokenIn, tokenOut, amount) {
    await sleep(200);

    
    const price = BASE_PRICE * (0.98 + Math.random() * 0.04); 
    const fee = 0.003; 

    return {
      dex: 'raydium',
      tokenIn,
      tokenOut,
      amount,
      price,
      fee,
      timestamp: new Date()
    };
  }


  async getMeteoraQuote(tokenIn, tokenOut, amount) {
    await sleep(200);

    
    const price = BASE_PRICE * (0.97 + Math.random() * 0.05); 
    const fee = 0.002; 

    return {
      dex: 'meteora',
      tokenIn,
      tokenOut,
      amount,
      price,
      fee,
      timestamp: new Date()
    };
  }


  chooseBestDex(quoteRaydium, quoteMeteora) {
    if (!quoteRaydium && !quoteMeteora) return null;
    if (!quoteRaydium) return quoteMeteora;
    if (!quoteMeteora) return quoteRaydium;

    return quoteRaydium.price >= quoteMeteora.price
      ? quoteRaydium
      : quoteMeteora;
  }

  
  async executeSwap(dexName, order, quotedPrice) {
    await sleep(1000);

    const executedPrice =
      quotedPrice * (0.99 + Math.random() * 0.02);

    const txHash = randomUUID().replace(/-/g, '');

    return {
      dex: dexName,
      txHash,
      executedPrice
    };
  }
}

module.exports = new MockDexRouter();
