document.addEventListener('DOMContentLoaded', () => {

  // =========================
  // Zmienne true / false
  // =========================
  let mvrv = false;
  let nupl = false;
  let sopr = false;
  let macd = false;
  let rsi = false;
  let standardDeviation = false;
  let longShortRatio = false;
  let fearGreedIndex = false;

  // =========================
  // Elementy formularza
  // =========================
  const form = document.getElementById('analyzer-form');
  const saveButton = document.getElementById('save-preset');
  const resultBox = document.getElementById('portfolio-result');

  // =========================
  // Checkboxy
  // =========================
  const checkbox_mvrv = document.querySelector('input[value="mvrv"]');
  const checkbox_nupl = document.querySelector('input[value="nupl"]');
  const checkbox_sopr = document.querySelector('input[value="sopr"]');
  const checkbox_macd = document.querySelector('input[value="macd"]');
  const checkbox_rsi = document.querySelector('input[value="rsi"]');
  const checkbox_sdeviation = document.querySelector('input[value="standarddeviation"]');
  const checkbox_longshort = document.querySelector('input[value="longshortratio"]');
  const checkbox_feargreed = document.querySelector('input[value="feargreedindex"]');

  // =========================
  // Aktualizacja zmiennych
  // =========================
  function updateCheckboxes() {
    mvrv = checkbox_mvrv.checked;
    nupl = checkbox_nupl.checked;
    sopr = checkbox_sopr.checked;
    macd = checkbox_macd.checked;
    rsi = checkbox_rsi.checked;
    standardDeviation = checkbox_sdeviation.checked;
    longShortRatio = checkbox_longshort.checked;
    fearGreedIndex = checkbox_feargreed.checked;
  }

  const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  allCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateCheckboxes);
  });

  // =========================
  // SAVE (debug)
  // =========================
  saveButton.addEventListener('click', () => {
    updateCheckboxes();

    const presetName = document.getElementById('preset-name').value.trim();
    if (!presetName) {
      alert('Podaj nazwę presetu!');
      return;
    }

    const timeframe = document.getElementById('timeframe').value;

    console.log('SAVE PRESET:', {
      presetName,
      timeframe,
      mvrv,
      nupl
    });

    alert('Preset zapisany (na razie tylko console.log)');
  });

  // =========================
  // OBLICZ
  // =========================
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    updateCheckboxes();
    const timeframe = document.getElementById('timeframe').value;

    resultBox.innerHTML = '';

    // =========================
    // MVRV
    // =========================
    if (mvrv === true) {
      fetch('/api/mvrv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe })
      })
        .then(res => res.json())
        .then(data => {
          if (!data || data.value === undefined) {
            throw new Error('Błędne dane MVRV');
          }

          resultBox.innerHTML += `
            <div>
              <strong>MVRV:</strong> ${data.value}<br>
              <small>Market Cap: ${data.marketCapUSD.toLocaleString()} USD</small><br>
              <small>Realized Cap: ${data.realizedCapUSD.toLocaleString()} USD</small>
            </div>
          `;
        })
        .catch(err => {
          console.error(err);
          resultBox.innerHTML += '<div style="color:red">Błąd MVRV</div>';
        });
    }

    // =========================
    // NUPL
    // =========================
    if (nupl === true) {
      fetch('/api/nupl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe })
      })
        .then(res => res.json())
        .then(data => {
          if (!data || data.value === undefined) {
            throw new Error('Błędne dane NUPL');
          }

          resultBox.innerHTML += `
            <div>
              <strong>NUPL:</strong> ${data.value}<br>
              <small>Market Cap: ${data.marketCapUSD.toLocaleString()} USD</small><br>
              <small>Realized Cap: ${data.realizedCapUSD.toLocaleString()} USD</small>
            </div>
          `;
        })
        .catch(err => {
          console.error(err);
          resultBox.innerHTML += '<div style="color:red">Błąd NUPL</div>';
        });
    }

  });

});
