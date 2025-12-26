const { getGlobalLongShortRatio } = require('../services/binanceService');

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr, avg) {
  const variance =
    arr.reduce((sum, x) => sum + Math.pow(x - avg, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

async function calculateLongShortZScore(timeframe) {
  // timeframe → ilość dni
  const map = {
    '7D': 30,
    '1M': 60,
    '3M': 90
  };

  const limit = map[timeframe] || 60;

  const ratios = await getGlobalLongShortRatio('BTCUSDT', '1d', limit);

  if (ratios.length < 20) {
    throw new Error('Za mało danych Long/Short');
  }

  const current = ratios[ratios.length - 1];
  const avg = mean(ratios);
  const sd = std(ratios, avg);

  let z = (current - avg) / sd;

  // kontrariańsko
  z = -z;

  let zone = 'neutral';
  if (z > 1.5) zone = 'strong long squeeze risk';
  else if (z < -1.5) zone = 'strong short squeeze risk';

  return {
    indicator: 'Long/Short Ratio',
    pair: 'BTC/USDT',
    timeframe,
    currentRatio: Number(current.toFixed(3)),
    mean: Number(avg.toFixed(3)),
    stdDev: Number(sd.toFixed(3)),
    zScore: Number(z.toFixed(2)),
    zone
  };
}

module.exports = { calculateLongShortZScore };
