const { getCryptoListings } = require('../services/coinmarketcapService');

exports.getCryptoData = async (req, res) => {
  try {
    const cryptoData = await getCryptoListings();
    res.json(cryptoData);
  } catch (error) {
    console.error('Błąd w kontrolerze API:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};
