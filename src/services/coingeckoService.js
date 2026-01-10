// src/algorithms/rsi.js
const { getBTCPrices } = require('../services/coingeckoService');

const RSI_PERIOD = 14;
const MIN_RSI_POINTS = 50;

function calculateRSIFromPrices(prices, period = RSI_PERIOD) {
  let gains = 0;
  let losses = 0;

  const recent = prices.slice(-(period + 1));

  for (let i = 1; i < recent.length; i++) {
    const diff = recent[i] - recent[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return Number(rsi.toFixed(2));
}

async function calculateRSI(timeframe) {
  const daysMap = {
    '1D': 7,
    '7D': 14,
    '1M': 30,
    '3M': 90
  };

  const days = Math.max(daysMap[timeframe] || 30, MIN_RSI_POINTS);
  const prices = await getBTCPrices(days);

  if (!prices || prices.length < MIN_RSI_POINTS) {
    throw new Error('Za mało danych do RSI');
  }

  const value = calculateRSIFromPrices(prices, RSI_PERIOD);

  let signal = 'neutral';
  if (value >= 70) signal = 'overbought';
  else if (value <= 30) signal = 'oversold';

  return {
    indicator: 'RSI',
    timeframe,
    period: RSI_PERIOD,
    value,
    signal
  };
}

module.exports = { calculateRSI };
