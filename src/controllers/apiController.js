const { getCryptoListings } = require('../services/coinmarketcapService');

const { calculateMVRV } = require('../algorithms/mvrv');
const { calculateNUPL } = require('../algorithms/nupl');
const { calculateRSI } = require('../algorithms/rsi');
const { calculateZScore } = require('../algorithms/z-score');
const { calculateLongShortZScore } = require('../algorithms/long&short-ratio');
const { calculateFearGreed } = require('../algorithms/fear&greed');
const { calculateMarketValuation } = require('../algorithms/marketValuation');

/**
 * Dashboard – not part of analysis pipeline
 */
exports.getCryptoData = async (req, res) => {
  try {
    const cryptoData = await getCryptoListings();
    res.json(cryptoData);
  } catch (error) {
    console.error('API /crypto error:', error);
    res.status(500).json({ error: 'Crypto dashboard error' });
  }
};

exports.getMVRV = async (req, res) => {
  try {
    // MVRV nie zależy od timeframe – liczone globalnie
    const result = await calculateMVRV('GLOBAL');
    res.json(result);
  } catch (error) {
    console.error('MVRV error:', error);
    res.status(500).json({ error: 'MVRV calculation error' });
  }
};


exports.getNUPL = async (req, res) => {
  try {
    // NUPL nie zależy od timeframe – liczone globalnie
    const result = await calculateNUPL('GLOBAL');
    res.json(result);
  } catch (error) {
    console.error('NUPL error:', error);
    res.status(500).json({ error: 'NUPL calculation error' });
  }
};


exports.getRSI = async (req, res) => {
  try {
    const { timeframe } = req.body;
    const result = await calculateRSI(timeframe);
    res.json(result);
  } catch (error) {
    console.error('RSI error:', error);
    res.status(500).json({ error: 'RSI calculation error' });
  }
};

exports.getZScore = async (req, res) => {
  try {
    const { timeframe } = req.body;
    if (!timeframe) {
      return res.status(400).json({ error: 'Timeframe is required' });
    }

    const result = await calculateZScore(timeframe);
    res.json(result);
  } catch (error) {
    console.error('Z-Score error:', error);
    res.status(500).json({ error: 'Z-Score calculation error' });
  }
};

exports.getLongShort = async (req, res) => {
  try {
    const { timeframe } = req.body;
    const result = await calculateLongShortZScore(timeframe);
    res.json(result);
  } catch (error) {
    console.error('Long/Short error:', error);
    res.status(500).json({ error: 'Long/Short calculation error' });
  }
};

exports.getFearGreed = async (req, res) => {
  try {
    const result = await calculateFearGreed();
    res.json(result);
  } catch (error) {
    console.error('Fear & Greed error:', error);
    res.status(500).json({ error: 'Fear & Greed calculation error' });
  }
};

exports.getMarketValuation = async (req, res) => {
  try {
    const analysisResult = req.body;
    const result = calculateMarketValuation(analysisResult);
    res.json(result);
  } catch (error) {
    console.error('Market valuation error:', error);
    res.status(500).json({ error: 'Market valuation error' });
  }
};
