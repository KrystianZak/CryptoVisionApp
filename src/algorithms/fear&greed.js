const { getFearGreedIndex } = require('../services/feargreedService');

async function calculateFearGreed() {
  const { value, classification } = await getFearGreedIndex();

  const zScore = Number(((value - 50) / 25).toFixed(2));

  let zone = 'neutral';
  if (zScore <= -1.5) zone = 'extreme fear';
  else if (zScore <= -0.5) zone = 'fear';
  else if (zScore >= 1.5) zone = 'extreme greed';
  else if (zScore >= 0.5) zone = 'greed';

  return {
    indicator: 'Fear & Greed',
    value,
    classification,
    zScore,
    zone
  };
}

module.exports = { calculateFearGreed };
