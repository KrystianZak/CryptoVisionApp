// src/algorithms/marketValuation.js

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
  const indicators = analysisResult.indicators || {};
  const scores = {};

  let totalScore = 0;
  let usedWeights = 0;

  // MVRV
  if (indicators.mvrv?.value !== undefined) {
    scores.mvrv = clamp(indicators.mvrv.value - 1);
    totalScore += scores.mvrv * WEIGHTS.mvrv;
    usedWeights += WEIGHTS.mvrv;
  }

  // NUPL
  if (indicators.nupl?.value !== undefined) {
    scores.nupl = clamp(indicators.nupl.value * 2);
    totalScore += scores.nupl * WEIGHTS.nupl;
    usedWeights += WEIGHTS.nupl;
  }

  // Z-SCORE
  if (indicators.zscore?.value !== undefined) {
    scores.zscore = clamp(indicators.zscore.value);
    totalScore += scores.zscore * WEIGHTS.zscore;
    usedWeights += WEIGHTS.zscore;
  }

  // RSI
  if (indicators.rsi?.value !== undefined) {
    scores.rsi = mapRSIToScore(indicators.rsi.value);
    totalScore += scores.rsi * WEIGHTS.rsi;
    usedWeights += WEIGHTS.rsi;
  }

  // LONG / SHORT
  if (indicators.longShort?.zScore !== undefined) {
    scores.longShort = clamp(indicators.longShort.zScore);
    totalScore += scores.longShort * WEIGHTS.longShort;
    usedWeights += WEIGHTS.longShort;
  }

  // FEAR & GREED
  if (indicators.fearGreed?.zScore !== undefined) {
    scores.fearGreed = clamp(indicators.fearGreed.zScore);
    totalScore += scores.fearGreed * WEIGHTS.fearGreed;
    usedWeights += WEIGHTS.fearGreed;
  }

  if (usedWeights === 0) {
    return {
      score: 0,
      valuation: 'neutral',
      breakdown: {},
      error: 'Brak wystarczających danych'
    };
  }

  const normalizedScore = totalScore / usedWeights;

  let valuation = 'neutral';
  if (normalizedScore <= -1) valuation = 'undervalued';
  else if (normalizedScore >= 1) valuation = 'overvalued';

  return {
    score: Number(normalizedScore.toFixed(3)),
    valuation,
    breakdown: scores,
    weights: WEIGHTS
  };
}

module.exports = { calculateMarketValuation };
