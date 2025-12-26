const { getBTCPrices } = require('../services/coingeckoService');

function calculateRSIFromPrices(prices, period = 14) {
    let gains = 0;
    let losses = 0;

    const recent = prices.slice(-(period + 1));

    for (let i = 1; i < recent.length; i++) {
        const diff = recent[i] - recent[i - 1];
        if (diff > 0) gains += diff;
        else losses += Math.abs(diff);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return Number((100 - 100 / (1 + rs)).toFixed(2));
}

async function calculateRSI(timeframe) {
    // RSI zawsze potrzebuje historii
    const daysMap = {
        '1D': 30,
        '7D': 30,
        '1M': 60,
        '3M': 120
    };

    const days = daysMap[timeframe] || 30;


    let prices;
    try {
        prices = await getBTCPrices(days);
    } catch (e) {
        console.error('CoinGecko prices error:', e.message);
        throw new Error('Błąd pobierania cen BTC');
    }

    if (!Array.isArray(prices) || prices.length < 20) {
        throw new Error(`Za mało danych RSI (${prices?.length || 0})`);
    }

    const value = calculateRSIFromPrices(prices, 14);

    let signal = 'neutral';
    if (value > 70) signal = 'overbought';
    else if (value < 30) signal = 'oversold';

    return {
        indicator: 'RSI',
        pair: 'BTC/USDT',
        timeframe,
        period: 14,
        value,
        signal
    };
}

module.exports = { calculateRSI };
