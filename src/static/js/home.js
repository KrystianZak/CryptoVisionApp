document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/crypto')
        .then(response => response.json())
        .then(data => {
            const cryptoList = data.data;
            const cryptoSummary = document.querySelector('.crypto-summary');

            const importantCoins = ['BTC', 'ETH', 'ADA', 'SOL', 'BNB']; // Jakie coiny chcemy pokazać

            importantCoins.forEach(symbol => {
                const coin = cryptoList.find(c => c.symbol === symbol);

                if (coin) {
                    const card = document.createElement('div');
                    card.classList.add('crypto-card');

                    const priceChange = coin.quote.USD.percent_change_24h.toFixed(2);
                    const changeClass = priceChange >= 0 ? 'positive' : 'negative';
                    const changeIcon = priceChange >= 0 ? '↗' : '↘';

                    card.innerHTML = `
                        <div class="crypto-header">
                            <div class="crypto-icon">
                                <img src="./images/${symbol.toLowerCase()}.svg" alt="${symbol}" class="coin-icon">
                            </div>
                            <div class="crypto-info">
                                <div class="crypto-pair">
                                    <span class="symbol">${symbol}</span>
                                    <span class="arrows">⇄</span>
                                    <span class="usd">USD</span>
                                </div>
                                <div class="crypto-change">
                                    <div class="change-indicator ${changeClass}">
                                        <span class="change-icon">${changeIcon}</span>
                                    </div>
                                    <span class="change-percent ${changeClass}">${Math.abs(priceChange)}%</span>
                                </div>
                            </div>
                        </div>
                        <div class="crypto-price">
                            ${coin.quote.USD.price.toFixed(2)}
                        </div>
                    `;

                    cryptoSummary.appendChild(card);
                }
            });
            const oldSummary = document.getElementById('old-summary');
            if (oldSummary) {
                oldSummary.style.display = 'none';
            }
        })
        .catch(error => console.error('Błąd ładowania kryptowalut:', error));
});