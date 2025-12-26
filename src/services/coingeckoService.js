// src/services/coingeckoService.js
const axios = require('axios');

// ================================
// 1️⃣ DANE BTC – market cap, supply itd. (MVRV, NUPL)
// ================================
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

// ================================
// 2️⃣ CENY BTC – do RSI (BTC/USDT ≈ BTC/USD)
// ================================
async function getBTCPrices(days = 30) {
  const response = await axios.get(
    'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
    {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: 'daily'
      },
      headers: {
        'User-Agent': 'CryptoVisionApp/1.0'
      }
    }
  );

  if (!response.data || !Array.isArray(response.data.prices)) {
    throw new Error('Brak danych prices z CoinGecko');
  }

  return response.data.prices.map(p => p[1]);
}


// ================================
// EXPORT
// ================================
module.exports = {
  getBitcoinMarketData,
  getBTCPrices
};
