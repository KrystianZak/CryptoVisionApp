document.addEventListener('DOMContentLoaded', () => {

  // =========================
  // GLOBALNY STAN ANALIZY
  // =========================
  let analysisResult = {
    meta: {},
    indicators: {}
  };

  // =========================
  // FLAGS
  // =========================
  let mvrv = false;
  let nupl = false;
  let rsi = false;
  let zscore = false;
  let longShort = false;
  let fearGreed = false;

  // =========================
  // ELEMENTY
  // =========================
  const form = document.getElementById('analyzer-form');
  const saveButton = document.getElementById('save-preset');
  const resultBox = document.getElementById('portfolio-result');

  // =========================
  // CHECKBOXY
  // =========================
  const checkbox_mvrv = document.querySelector('input[value="mvrv"]');
  const checkbox_nupl = document.querySelector('input[value="nupl"]');
  const checkbox_rsi = document.querySelector('input[value="rsi"]');
  const checkbox_zscore = document.querySelector('input[value="standarddeviation"]');
  const checkbox_longshort = document.querySelector('input[value="longshortratio"]');
  const checkbox_feargreed = document.querySelector('input[value="feargreedindex"]');

  function updateCheckboxes() {
    mvrv = checkbox_mvrv?.checked || false;
    nupl = checkbox_nupl?.checked || false;
    rsi = checkbox_rsi?.checked || false;
    zscore = checkbox_zscore?.checked || false;
    longShort = checkbox_longshort?.checked || false;
    fearGreed = checkbox_feargreed?.checked || false;
  }

  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach(cb => cb.addEventListener('change', updateCheckboxes));

  // =========================
  // SAVE PRESET (DEBUG)
  // =========================
  saveButton.addEventListener('click', () => {
    updateCheckboxes();

    const presetName = document.getElementById('preset-name').value.trim();
    const timeframe = document.getElementById('timeframe').value;

    console.log('SAVE PRESET:', {
      presetName,
      timeframe,
      mvrv,
      nupl,
      rsi,
      zscore,
      longShort,
      fearGreed
    });
  });

  // =========================
  // OBLICZ
  // =========================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateCheckboxes();

    const timeframe = document.getElementById('timeframe').value;
    resultBox.innerHTML = '';

    // reset stanu analizy
    analysisResult = {
      meta: {
        timeframe,
        createdAt: new Date().toISOString()
      },
      indicators: {}
    };

    // =========================
    // MVRV
    // =========================
    if (mvrv) {
      try {
        const res = await fetch('/api/mvrv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeframe })
        });
        const data = await res.json();

        // ✅ ZAPIS DO STANU
        analysisResult.indicators.mvrv = {
          value: data.value,
          marketCap: data.marketCapUSD,
          realizedCap: data.realizedCapUSD
        };

        resultBox.innerHTML += `
          <div>
            <strong>MVRV:</strong> ${data.value}
          </div><hr>
        `;
      } catch {
        resultBox.innerHTML += '<div style="color:red">Błąd MVRV</div><hr>';
      }
    }

    // =========================
    // NUPL
    // =========================
    if (nupl) {
      try {
        const res = await fetch('/api/nupl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeframe })
        });
        const data = await res.json();

        analysisResult.indicators.nupl = {
          value: data.value,
          marketCap: data.marketCapUSD,
          realizedCap: data.realizedCapUSD
        };

        resultBox.innerHTML += `
          <div>
            <strong>NUPL:</strong> ${data.value}
          </div><hr>
        `;
      } catch {
        resultBox.innerHTML += '<div style="color:red">Błąd NUPL</div><hr>';
      }
    }

    // =========================
    // RSI
    // =========================
    if (rsi) {
      try {
        const res = await fetch('/api/rsi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeframe })
        });
        const data = await res.json();

        analysisResult.indicators.rsi = {
          value: data.value,
          period: data.period,
          signal: data.signal
        };

        resultBox.innerHTML += `
          <div>
            <strong>RSI:</strong> ${data.value} (${data.signal})
          </div><hr>
        `;
      } catch {
        resultBox.innerHTML += '<div style="color:red">Błąd RSI</div><hr>';
      }
    }

    // =========================
    // Z-SCORE
    // =========================
    if (zscore) {
      try {
        const res = await fetch('/api/zscore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeframe })
        });
        const data = await res.json();

        analysisResult.indicators.zscore = {
          value: data.value,
          price: data.currentPrice,
          mean: data.meanPrice,
          stdDev: data.stdDev,
          zone: data.zone
        };

        resultBox.innerHTML += `
          <div>
            <strong>Z-Score:</strong> ${data.value}
          </div><hr>
        `;
      } catch {
        resultBox.innerHTML += '<div style="color:red">Błąd Z-Score</div><hr>';
      }
    }

    // =========================
    // LONG / SHORT
    // =========================
    if (longShort) {
      try {
        const res = await fetch('/api/longshort', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeframe })
        });
        const data = await res.json();

        analysisResult.indicators.longShort = {
          zScore: data.zScore,
          currentRatio: data.currentRatio,
          mean: data.mean,
          stdDev: data.stdDev,
          zone: data.zone
        };

        resultBox.innerHTML += `
          <div>
            <strong>Long / Short:</strong> ${data.zScore}
          </div><hr>
        `;
      } catch {
        resultBox.innerHTML += '<div style="color:red">Błąd Long / Short</div><hr>';
      }
    }

    // =========================
    // FEAR & GREED
    // =========================
    if (fearGreed) {
      try {
        const res = await fetch('/api/feargreed', { method: 'POST' });
        const data = await res.json();

        analysisResult.indicators.fearGreed = {
          value: data.value,
          zScore: data.zScore,
          zone: data.zone
        };

        resultBox.innerHTML += `
          <div>
            <strong>Fear & Greed:</strong> ${data.value} (${data.zone})
          </div><hr>
        `;
      } catch {
        resultBox.innerHTML += '<div style="color:red">Błąd Fear & Greed</div><hr>';
      }
    }

    try {
      const res = await fetch('/api/marketvaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisResult)
      });

      const valuation = await res.json();

      // zapis do stanu
      analysisResult.marketValuation = valuation;

      resultBox.innerHTML += `
    <div style="padding:10px; background:#ED474A; border:1px solid #444">
      <strong>Market Valuation:</strong><br>
      Score: ${valuation.score}<br>
      Status: <b>${valuation.valuation}</b>
    </div><hr>
  `;
    } catch {
      resultBox.innerHTML += '<div style="color:red">Błąd Market Valuation</div><hr>';
    }
    // 🔍 TERAZ MASZ WSZYSTKO W JEDNYM MIEJSCU
    console.log('FINAL ANALYSIS RESULT:', analysisResult);
  });

});
