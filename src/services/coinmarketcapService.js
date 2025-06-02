const axios = require('axios');
const { COINMARKETCAP_API_KEY } = require('../apiConfig');

exports.getCryptoListings = async () => {
  const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
    headers: {
      'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY
    },
    params: {
      start: '1',
      limit: '10',
      convert: 'USD'
    }
  });

  return response.data;
};
