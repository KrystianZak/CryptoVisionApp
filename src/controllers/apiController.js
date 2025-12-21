const { getCryptoListings } = require('../services/coinmarketcapService');
const { calculateMVRV } = require('../algorithms/mvrv');
const { calculateNUPL } = require('../algorithms/nupl');


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
