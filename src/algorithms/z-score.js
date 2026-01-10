const { getBTCPrices } = require('../services/marketDataService');

const MIN_ZSCORE_POINTS = 72;

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDeviation(values, avg) {
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

async function calculateZScore(timeframe) {
  const daysMap = {
    '1D': 3,
    '7D': 7,
    '1M': 30,
    '3M': 120
  };

  const days = daysMap[timeframe] || 30;
  const prices = await getBTCPrices(days);

  if (!prices || prices.length < MIN_ZSCORE_POINTS) {
    throw new Error(`Za mało danych do Z-Score (${prices?.length ?? 0})`);
  }

  const currentPrice = prices.at(-1);
  const avg = mean(prices);
  const std = stdDeviation(prices, avg);

  const zScore = (currentPrice - avg) / std;

  let zone = 'neutral';
  if (zScore >= 2) zone = 'extremely_overvalued';
  else if (zScore >= 1) zone = 'overvalued';
  else if (zScore <= -2) zone = 'extremely_undervalued';
  else if (zScore <= -1) zone = 'undervalued';

  return {
    indicator: 'Z-SCORE',
    timeframe,
    days,
    currentPrice: Number(currentPrice.toFixed(2)),
    meanPrice: Number(avg.toFixed(2)),
    stdDev: Number(std.toFixed(2)),
    value: Number(zScore.toFixed(2)),
    zone
  };
}

module.exports = { calculateZScore };
