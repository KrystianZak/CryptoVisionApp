document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // GLOBAL STATE
  // =========================
  let analysisResult = null;

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
  // ELEMENTS
  // =========================
  const form = document.getElementById("analyzer-form");
  const resultBox = document.getElementById("analyzer-result");
  const exportBtn = document.getElementById("export-pdf");

  // =========================
  // CHECKBOXES
  // =========================
  const checkbox_mvrv = document.querySelector('input[value="mvrv"]');
  const checkbox_nupl = document.querySelector('input[value="nupl"]');
  const checkbox_rsi = document.querySelector('input[value="rsi"]');
  const checkbox_zscore = document.querySelector('input[value="standarddeviation"]');
  const checkbox_longshort = document.querySelector('input[value="longshortratio"]');
  const checkbox_feargreed = document.querySelector('input[value="feargreedindex"]');

  function updateCheckboxes() {
    mvrv = checkbox_mvrv?.checked ?? false;
    nupl = checkbox_nupl?.checked ?? false;
    rsi = checkbox_rsi?.checked ?? false;
    zscore = checkbox_zscore?.checked ?? false;
    longShort = checkbox_longshort?.checked ?? false;
    fearGreed = checkbox_feargreed?.checked ?? false;
  }

  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach(cb => cb.addEventListener("change", updateCheckboxes));

  // =========================
  // FETCH HELPER
  // =========================
  async function fetchJSON(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }

  // =========================
  // UI HELPERS
  // =========================
  function renderEmpty() {
    resultBox.innerHTML = `
      <div class="an-card an-empty">
        <div class="an-empty__title">Brak wyników</div>
        <div class="an-empty__text">Zaznacz wskaźniki i kliknij „Oblicz”.</div>
      </div>
    `;
  }

  function pillClass(zone = "") {
    const z = String(zone).toLowerCase();
    if (z.includes("under") || z.includes("fear")) return "an-pill--good";
    if (z.includes("over") || z.includes("greed")) return "an-pill--bad";
    return "an-pill--neutral";
  }

  function fmt(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : "—";
  }

  function renderAnalysis(state) {
    const rows = Object.entries(state.indicators).map(([key, d]) => {
      if (!d) {
        return `
          <div class="an-row">
            <div class="an-row-title">${key.toUpperCase()}</div>
            <span class="an-pill an-pill--neutral">Brak danych</span>
          </div>
        `;
      }

      const label = d.signal || d.zone || "neutral";
      const value =
        key === "longShort" ? d.zScore :
        key === "fearGreed" ? d.value :
        d.value;

      return `
        <div class="an-row">
          <div>
            <div class="an-row-title">${key.toUpperCase()}</div>
            <span class="an-pill ${pillClass(label)}">${label}</span>
          </div>
          <span class="an-pill">Value: ${fmt(value)}</span>
        </div>
      `;
    }).join("");

    const mv = state.marketValuation;

    resultBox.innerHTML = `
      <div class="an-grid">
        <div class="an-card">
          <div class="an-section-title">Wyniki</div>
          ${rows}
        </div>

        <div class="an-card an-valuation">
          <div class="an-valuation-score">${fmt(mv?.score)}</div>
          <span class="an-pill ${pillClass(mv?.valuation)}">${mv?.valuation ?? "—"}</span>
        </div>
      </div>
    `;
  }

  // =========================
  // CALCULATE
  // =========================
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    updateCheckboxes();

    const timeframe = document.getElementById("timeframe")?.value ?? "7D";

    analysisResult = {
      meta: { timeframe, createdAt: new Date().toISOString() },
      indicators: {},
      marketValuation: null
    };

    resultBox.innerHTML = `<div class="an-card">Analiza w toku…</div>`;

    const jobs = [];

    if (mvrv) jobs.push(fetchJSON("/api/mvrv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeframe })
    }).then(d => analysisResult.indicators.mvrv = d).catch(() => analysisResult.indicators.mvrv = null));

    if (nupl) jobs.push(fetchJSON("/api/nupl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeframe })
    }).then(d => analysisResult.indicators.nupl = d).catch(() => analysisResult.indicators.nupl = null));

    if (rsi) jobs.push(fetchJSON("/api/rsi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeframe })
    }).then(d => analysisResult.indicators.rsi = d).catch(() => analysisResult.indicators.rsi = null));

    if (zscore) jobs.push(fetchJSON("/api/zscore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeframe })
    }).then(d => analysisResult.indicators.zscore = d).catch(() => analysisResult.indicators.zscore = null));

    if (longShort) jobs.push(fetchJSON("/api/longshort", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeframe })
    }).then(d => analysisResult.indicators.longShort = d).catch(() => analysisResult.indicators.longShort = null));

    if (fearGreed) jobs.push(fetchJSON("/api/feargreed", { method: "POST" })
      .then(d => analysisResult.indicators.fearGreed = d)
      .catch(() => analysisResult.indicators.fearGreed = null));

    await Promise.all(jobs);

    analysisResult.marketValuation = await fetchJSON("/api/marketvaluation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analysisResult)
    }).catch(() => null);

    renderAnalysis(analysisResult);
  });

  // =========================
  // EXPORT PDF (CLEAN REPORT)
  // =========================
  exportBtn?.addEventListener("click", () => {
    if (!analysisResult) {
      alert("Brak wyników do eksportu");
      return;
    }

    const rows = Object.entries(analysisResult.indicators)
      .filter(([_, d]) => d)
      .map(([key, d]) => `
        <tr>
          <td>${key.toUpperCase()}</td>
          <td>${d.signal || d.zone || "neutral"}</td>
          <td>${(d.value ?? d.zScore).toFixed(2)}</td>
        </tr>
      `).join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>CryptoVision – Report</title>
<style>
body { font-family: Arial; margin:40px; }
h1 { text-align:center; }
table { width:100%; border-collapse:collapse; margin-top:30px; }
th, td { border:1px solid #000; padding:10px; text-align:center; }
th { background:#eee; }
.score { margin-top:40px; text-align:center; font-size:40px; font-weight:bold; }
.zone { font-size:14px; margin-top:6px; }
</style>
</head>
<body>
<h1>CryptoVision – Market Analysis</h1>
<p style="text-align:center;">
Timeframe: ${analysisResult.meta.timeframe}<br>
Generated: ${new Date(analysisResult.meta.createdAt).toLocaleString()}
</p>

<table>
<tr><th>Indicator</th><th>Signal</th><th>Value</th></tr>
${rows}
</table>

<div class="score">
${analysisResult.marketValuation.score.toFixed(2)}
<div class="zone">${analysisResult.marketValuation.valuation}</div>
</div>

</body>
</html>
`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.print();
  });

  renderEmpty();
  updateCheckboxes();
});
