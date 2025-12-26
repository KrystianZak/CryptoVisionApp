const axios = require('axios');

async function getFearGreedIndex() {
  const res = await axios.get('https://api.alternative.me/fng/');
  const item = res.data.data[0];

  return {
    value: Number(item.value),
    classification: item.value_classification
  };
}

module.exports = { getFearGreedIndex };
