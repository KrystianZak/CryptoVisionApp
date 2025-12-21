const { getBitcoinMarketData } = require('../services/coingeckoService');

async function calculateNUPL(timeframe) {
  console.log('START NUPL', timeframe);

  const btcData = await getBitcoinMarketData();

  const marketCap = btcData.market_data?.market_cap?.usd;
  if (!marketCap) {
    throw new Error('Brak market cap');
  }

  // Proxy realized cap – ta sama logika co w MVRV
  const realizedCap = marketCap * 0.7;

  const nupl = (marketCap - realizedCap) / marketCap;

  return {
    indicator: 'NUPL',
    timeframe,
    value: Number(nupl.toFixed(3)),
    marketCapUSD: Math.round(marketCap),
    realizedCapUSD: Math.round(realizedCap)
  };
}

module.exports = {
  calculateNUPL
};
