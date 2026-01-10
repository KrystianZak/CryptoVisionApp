const { getBTCPrices } = require('../services/marketDataService');

const RSI_PERIOD = 14;
const MIN_RSI_POINTS = 20;

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
  return Number((100 - 100 / (1 + rs)).toFixed(2));
}

async function calculateRSI(timeframe) {
  const daysMap = {
    '1D': 2,
    '7D': 7,
    '1M': 30,
    '3M': 90
  };

  const days = daysMap[timeframe] || 30;
  const prices = await getBTCPrices(days);

  if (!prices || prices.length < MIN_RSI_POINTS) {
    throw new Error(`Za mało danych do RSI (${prices?.length ?? 0})`);
  }

  const value = calculateRSIFromPrices(prices);

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
