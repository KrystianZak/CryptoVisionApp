const axios = require('axios');

/**
 * In-memory cache + in-flight deduplication
 */
const priceCache = new Map();      // key -> { data, ts }
const priceInFlight = new Map();   // key -> Promise

const marketCache = {
  data: null,
  ts: 0,
  inFlight: null
};

const CACHE_TTL = 60 * 1000; // 60 sekund

async function getBTCPrices(days = 30) {
  const key = `btc_prices_${days}`;
  const now = Date.now();

  // 1️⃣ zwróć cache jeśli świeży
  const cached = priceCache.get(key);
  if (cached && now - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  // 2️⃣ jeśli request już leci — poczekaj na niego
  if (priceInFlight.has(key)) {
    return priceInFlight.get(key);
  }

  // 3️⃣ wykonaj request
  const promise = axios
    .get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart', {
      params: {
        vs_currency: 'usd',
        days
      }
    })
    .then(res => {
      const prices = res.data.prices.map(p => p[1]);
      priceCache.set(key, { data: prices, ts: Date.now() });
      return prices;
    })
    .finally(() => {
      priceInFlight.delete(key);
    });

  priceInFlight.set(key, promise);
  return promise;
}

async function getBitcoinMarketData() {
  const now = Date.now();

  if (marketCache.data && now - marketCache.ts < CACHE_TTL) {
    return marketCache.data;
  }

  if (marketCache.inFlight) {
    return marketCache.inFlight;
  }

  const promise = axios
    .get('https://api.coingecko.com/api/v3/coins/bitcoin', {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    })
    .then(res => {
      marketCache.data = res.data;
      marketCache.ts = Date.now();
      return res.data;
    })
    .finally(() => {
      marketCache.inFlight = null;
    });

  marketCache.inFlight = promise;
  return promise;
}

module.exports = {
  getBTCPrices,
  getBitcoinMarketData
};
