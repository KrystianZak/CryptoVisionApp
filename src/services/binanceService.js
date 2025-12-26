const axios = require('axios');

async function getGlobalLongShortRatio(symbol = 'BTCUSDT', period = '1d', limit = 90) {
  const res = await axios.get(
    'https://fapi.binance.com/futures/data/globalLongShortAccountRatio',
    {
      params: {
        symbol,
        period,
        limit
      }
    }
  );

  // zwracamy same wartości ratio jako number[]
  return res.data.map(d => Number(d.longShortRatio));
}

module.exports = {
  getGlobalLongShortRatio
};
