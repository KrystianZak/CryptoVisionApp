document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/crypto')
        .then(response => response.json())
        .then(data => {
            const cryptoList = data.data;
            const cryptoSummary = document.querySelector('.crypto-summary');

            const importantCoins = ['BTC', 'ETH']; // Jakie coiny chcemy pokazać

            importantCoins.forEach(symbol => {
                const coin = cryptoList.find(c => c.symbol === symbol);

                if (coin) {
                    const card = document.createElement('div');
                    card.classList.add('crypto-card');

                    const priceChange = coin.quote.USD.percent_change_24h.toFixed(2);
                    const changeClass = priceChange >= 0 ? 'positive' : 'negative';

                    card.innerHTML = `
              <h3>${coin.name} (${coin.symbol})</h3>
              <p>Cena: $${coin.quote.USD.price.toFixed(2)}</p>
              <p class="${changeClass}">Zmiana 24h: ${priceChange}%</p>
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
