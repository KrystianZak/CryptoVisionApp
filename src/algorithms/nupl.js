const { getBitcoinMarketData } = require('../services/marketDataService');

async function calculateNUPL(timeframe) {
  console.log('START NUPL', timeframe);

  const btcData = await getBitcoinMarketData();

  const marketCap = btcData?.market_data?.market_cap?.usd;
  if (!Number.isFinite(marketCap)) {
    throw new Error('NUPL: Brak market cap');
  }

  // Proxy realized cap (świadome uproszczenie)
  const realizedCap = marketCap * 0.7;

  const nuplRaw = (marketCap - realizedCap) / marketCap;
  const nupl = Number(nuplRaw.toFixed(3));

  return {
    indicator: 'NUPL',
    timeframe,
    value: nupl,
    marketCapUSD: Math.round(marketCap),
    realizedCapUSD: Math.round(realizedCap),
    proxy: true // WAŻNE: jawne uproszczenie do pracy inżynierskiej
  };
}

module.exports = {
  calculateNUPL
};
