document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('portfolio-form');
    const coinsSelect = document.getElementById('coins');
    const percentagesContainer = document.getElementById('percentages-container');
    const resultDiv = document.getElementById('portfolio-result');
  
    // Kiedy użytkownik wybiera kryptowaluty
    coinsSelect.addEventListener('change', () => {
      percentagesContainer.innerHTML = ''; // Czyścimy kontener
  
      const selectedCoins = Array.from(coinsSelect.selectedOptions).map(option => option.value);
  
      selectedCoins.forEach(coin => {
        const div = document.createElement('div');
        div.classList.add('form-group');
        div.innerHTML = `
          <label for="percent-${coin}">${coin} (%)</label>
          <input type="number" id="percent-${coin}" name="percent-${coin}" min="0" max="100" required>
        `;
        percentagesContainer.appendChild(div);
      });
    });
  
    // Obsługa submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const capital = parseFloat(document.getElementById('capital').value);
      const selectedCoins = Array.from(coinsSelect.selectedOptions).map(option => option.value);
  
      let totalPercent = 0;
      const allocations = [];
  
      selectedCoins.forEach(coin => {
        const percentInput = document.getElementById(`percent-${coin}`);
        const percent = parseFloat(percentInput.value);
        if (!isNaN(percent)) {
          totalPercent += percent;
          allocations.push({ coin, percent });
        }
      });
  
      if (totalPercent !== 100) {
        resultDiv.innerHTML = `<p style="color: red;">❗ Suma procentów musi wynosić 100%! (obecnie: ${totalPercent}%)</p>`;
        return;
      }
  
      let tableHTML = `
        <table class="portfolio-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Target Allocation (%)</th>
              <th>Target Amount (USD)</th>
            </tr>
          </thead>
          <tbody>
      `;
  
      allocations.forEach(entry => {
        const allocationAmount = ((capital * entry.percent) / 100).toFixed(2);
        tableHTML += `
          <tr>
            <td>${entry.coin}</td>
            <td>${entry.percent}%</td>
            <td>$${allocationAmount}</td>
          </tr>
        `;
      });
  
      tableHTML += `</tbody></table>`;
      resultDiv.innerHTML = tableHTML;
    });
  });
  