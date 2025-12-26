function clamp(value, min = -2, max = 2) {
  return Math.max(min, Math.min(max, value));
}

function mapRSIToScore(rsi) {
  if (rsi <= 30) return -1;
  if (rsi >= 70) return 1;
  return 0;
}

const WEIGHTS = {
  mvrv: 0.30,
  nupl: 0.20,
  zscore: 0.20,
  rsi: 0.10,
  longShort: 0.10,
  fearGreed: 0.10
};

function calculateMarketValuation(analysisResult) {
  const scores = {};
  let totalScore = 0;

  const indicators = analysisResult.indicators;

  // =========================
  // MVRV
  // =========================
  if (indicators.mvrv) {
    scores.mvrv = clamp(indicators.mvrv.value - 1); 
    totalScore += scores.mvrv * WEIGHTS.mvrv;
  }

  // =========================
  // NUPL
  // =========================
  if (indicators.nupl) {
    scores.nupl = clamp(indicators.nupl.value * 2);
    totalScore += scores.nupl * WEIGHTS.nupl;
  }

  // =========================
  // Z-SCORE PRICE
  // =========================
  if (indicators.zscore) {
    scores.zscore = clamp(indicators.zscore.value);
    totalScore += scores.zscore * WEIGHTS.zscore;
  }

  // =========================
  // RSI
  // =========================
  if (indicators.rsi) {
    scores.rsi = mapRSIToScore(indicators.rsi.value);
    totalScore += scores.rsi * WEIGHTS.rsi;
  }

  // =========================
  // LONG / SHORT
  // =========================
  if (indicators.longShort) {
    scores.longShort = clamp(indicators.longShort.zScore);
    totalScore += scores.longShort * WEIGHTS.longShort;
  }

  // =========================
  // FEAR & GREED
  // =========================
  if (indicators.fearGreed) {
    scores.fearGreed = clamp(indicators.fearGreed.zScore);
    totalScore += scores.fearGreed * WEIGHTS.fearGreed;
  }

  // =========================
  // INTERPRETACJA
  // =========================
  let valuation = 'neutral';
  if (totalScore <= -1) valuation = 'undervalued';
  else if (totalScore >= 1) valuation = 'overvalued';

  return {
    score: Number(totalScore.toFixed(3)),
    valuation,
    breakdown: scores,
    weights: WEIGHTS
  };
}

module.exports = { calculateMarketValuation };
