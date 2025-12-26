const { getCryptoListings } = require('../services/coinmarketcapService');
const { calculateMVRV } = require('../algorithms/mvrv');
const { calculateNUPL } = require('../algorithms/nupl');
const { calculateRSI } = require('../algorithms/rsi');
const { calculateZScore } = require('../algorithms/z-score');
const { calculateLongShortZScore } = require('../algorithms/long&short-ratio');
const { calculateFearGreed } = require('../algorithms/fear&greed');
const { calculateMarketValuation } = require('../algorithms/marketValuation');



exports.getCryptoData = async (req, res) => {
  try {
    const cryptoData = await getCryptoListings();
    res.json(cryptoData);
  } catch (error) {
    console.error('Błąd w kontrolerze API:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

exports.getMVRV = async (req, res) => {
  try {
    const { timeframe } = req.body;
    const result = await calculateMVRV(timeframe);
    res.json(result);
  } catch (error) {
    console.error('Błąd liczenia MVRV:', error);
    res.status(500).json({ error: 'Błąd obliczania MVRV' });
  }
};

exports.getNUPL = async (req, res) => {
  try {
    const { timeframe } = req.body;
    const result = await calculateNUPL(timeframe);
    res.json(result);
  } catch (error) {
    console.error('Błąd liczenia NUPL:', error);
    res.status(500).json({ error: 'Błąd obliczania NUPL' });
  }
};

exports.getRSI = async (req, res) => {
  try {
    const { timeframe } = req.body;
    console.log('RSI request timeframe:', timeframe);

    const result = await calculateRSI(timeframe);
    res.json(result);
  } catch (e) {
    console.error('RSI ERROR:', e.message);
    res.status(500).json({ error: e.message });
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
    console.error('Błąd liczenia Z-Score:', error);
    res.status(500).json({ error: 'Z-Score error' });
  }
};

exports.getLongShort = async (req, res) => {
  try {
    const { timeframe } = req.body;
    const result = await calculateLongShortZScore(timeframe);
    res.json(result);
  } catch (e) {
    console.error('Long/Short error:', e);
    res.status(500).json({ error: 'Long/Short error' });
  }
};

exports.getFearGreed = async (req, res) => {
  try {
    const result = await calculateFearGreed();
    res.json(result);
  } catch (e) {
    console.error('FearGreed error:', e);
    res.status(500).json({ error: 'Fear & Greed error' });
  }
};

exports.getMarketValuation = async (req, res) => {
  try {
    const analysisResult = req.body;
    const result = calculateMarketValuation(analysisResult);
    res.json(result);
  } catch (e) {
    console.error('Market valuation error:', e);
    res.status(500).json({ error: 'Market valuation error' });
  }
};