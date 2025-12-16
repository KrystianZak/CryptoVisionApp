const { getBitcoinMarketData } = require('../services/coingeckoService');

async function calculateMVRV(timeframe) {
  console.log('START MVRV', timeframe);

  const btcData = await getBitcoinMarketData();

  const marketCap = btcData.market_data?.market_cap?.usd;
  if (!marketCap) {
    throw new Error('Brak market cap');
  }

  const realizedCap = marketCap * 0.7;
  const mvrv = marketCap / realizedCap;

  return {
    indicator: 'MVRV',
    timeframe,
    value: Number(mvrv.toFixed(3)),
    marketCapUSD: Math.round(marketCap),
    realizedCapUSD: Math.round(realizedCap)
  };
}

module.exports = {
  calculateMVRV
};
