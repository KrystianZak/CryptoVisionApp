// src/services/coingeckoService.js
const axios = require('axios');

async function getBitcoinMarketData() {
  const response = await axios.get(
    'https://api.coingecko.com/api/v3/coins/bitcoin',
    {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    }
  );

  return response.data;
}

module.exports = {
  getBitcoinMarketData
};
