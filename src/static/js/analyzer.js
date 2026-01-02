document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // GLOBALNY STAN ANALIZY
  // =========================
  let analysisResult = {
    meta: {},
    indicators: {},
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
  const form = document.getElementById("analyzer-form");
  const saveButton = document.getElementById("save-preset");
  const resultBox = document.getElementById("analyzer-result");

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

  document.querySelectorAll('input[type="checkbox"]').forEach((cb) =>
    cb.addEventListener("change", updateCheckboxes)
  );

  // =========================
  // UI: Placeholder
  // =========================
  function renderEmpty() {
    if (!resultBox) return;
    resultBox.innerHTML = `
      <div class="an-card an-empty">
        <div class="an-empty__icon">📈</div>
        <div class="an-empty__title">Brak wyników</div>
        <div class="an-empty__text">Zaznacz wskaźniki i kliknij „Oblicz”, aby zobaczyć analizę.</div>
      </div>
    `;
  }

  // =========================
  // RENDER HELPERS
  // =========================
  function pillClassForZone(zoneOrValuation = "") {
    const z = String(zoneOrValuation).toLowerCase();

    if (
      z.includes("undervalu") ||
      z.includes("buy") ||
      z.includes("fear") ||
      z.includes("low") ||
      z.includes("accum") ||
      z.includes("green")
    )
      return "an-pill--good";

    if (
      z.includes("overvalu") ||
      z.includes("sell") ||
      z.includes("greed") ||
      z.includes("high") ||
      z.includes("red") ||
      z.includes("distribution")
    )
      return "an-pill--bad";

    return "an-pill--neutral";
  }

  function formatMaybeNumber(v) {
    const n = Number(v);
    if (Number.isFinite(n)) return n.toFixed(2);
    if (v === null || v === undefined || v === "") return "-";
    return String(v);
  }

  function renderAnalysis(state) {
    if (!resultBox) return;

    const tf = state?.meta?.timeframe ?? "-";
    const created = state?.meta?.createdAt ? new Date(state.meta.createdAt).toLocaleString() : "-";

    const indicators = state?.indicators ?? {};
    const entries = Object.entries(indicators);

    const titleMap = {
      mvrv: "MVRV",
      nupl: "NUPL",
      rsi: "RSI",
      zscore: "Z-Score",
      longShort: "Long / Short Ratio",
      fearGreed: "Fear & Greed Index",
    };

    const indicatorRows =
      entries.length > 0
        ? entries
            .map(([key, data]) => {
              const title = titleMap[key] ?? key;

              // jeśli błąd
              if (data?.error) {
                return `
                  <div class="an-row">
                    <div class="an-row-left">
                      <div class="an-row-title">${title}</div>
                      <div class="an-row-meta">
                        <span class="an-pill an-pill--bad">Błąd pobierania danych</span>
                      </div>
                    </div>
                    <div class="an-row-right">
                      <span class="an-pill an-pill--bad">—</span>
                    </div>
                  </div>
                `;
              }

              // meta zależnie od typu
              let metaHTML = "";

              if (key === "mvrv" || key === "nupl") {
                metaHTML = `
                  <span class="an-pill an-pill--neutral">MarketCap: ${formatMaybeNumber(data.marketCap)}</span>
                  <span class="an-pill an-pill--neutral">RealizedCap: ${formatMaybeNumber(data.realizedCap)}</span>
                `;
              } else if (key === "rsi") {
                metaHTML = `
                  <span class="an-pill an-pill--neutral">Period: ${formatMaybeNumber(data.period)}</span>
                  <span class="an-pill ${pillClassForZone(data.signal)}">${String(data.signal ?? "-")}</span>
                `;
              } else if (key === "zscore") {
                metaHTML = `
                  <span class="an-pill an-pill--neutral">Price: ${formatMaybeNumber(data.price)}</span>
                  <span class="an-pill ${pillClassForZone(data.zone)}">${String(data.zone ?? "-")}</span>
                `;
              } else if (key === "longShort") {
                metaHTML = `
                  <span class="an-pill an-pill--neutral">Ratio: ${formatMaybeNumber(data.currentRatio)}</span>
                  <span class="an-pill ${pillClassForZone(data.zone)}">${String(data.zone ?? "-")}</span>
                `;
              } else if (key === "fearGreed") {
                metaHTML = `
                  <span class="an-pill ${pillClassForZone(data.zone)}">${String(data.zone ?? "-")}</span>
                `;
              }

              const mainVal =
                key === "fearGreed"
                  ? formatMaybeNumber(data.value)
                  : key === "longShort"
                  ? formatMaybeNumber(data.zScore)
                  : formatMaybeNumber(data.value);

              return `
                <div class="an-row">
                  <div class="an-row-left">
                    <div class="an-row-title">${title}</div>
                    <div class="an-row-meta">${metaHTML}</div>
                  </div>
                  <div class="an-row-right">
                    <span class="an-pill an-pill--neutral">Value: ${mainVal}</span>
                  </div>
                </div>
              `;
            })
            .join("")
        : `<div class="an-muted">Nie wybrano żadnych wskaźników.</div>`;

    // Market valuation
    const valuation = state?.marketValuation;

    const valuationHTML = valuation?.error
      ? `
        <div class="an-card an-valuation">
          <div class="an-muted">Błąd Market Valuation (API zwróciło błąd).</div>
        </div>
      `
      : valuation
      ? (() => {
          const score = formatMaybeNumber(valuation.score);
          const status = String(valuation.valuation ?? "-");
          const cls = pillClassForZone(status);

          return `
            <div class="an-card an-valuation">
              <div class="an-valuation-top">
                <div>
                  <div class="an-valuation-sub">Market valuation</div>
                  <div class="an-valuation-score">${score}</div>
                </div>
                <span class="an-pill ${cls}">${status}</span>
              </div>

              <div class="an-kv">
                <div class="an-kv-row">
                  <div class="an-kv-key">Timeframe</div>
                  <div class="an-kv-val">${tf}</div>
                </div>
                <div class="an-kv-row">
                  <div class="an-kv-key">Generated</div>
                  <div class="an-kv-val">${created}</div>
                </div>
                <div class="an-kv-row">
                  <div class="an-kv-key">Indicators used</div>
                  <div class="an-kv-val">${entries.length}</div>
                </div>
              </div>
            </div>
          `;
        })()
      : `
        <div class="an-card an-valuation">
          <div class="an-muted">Brak market valuation (brak danych lub nie kliknięto „Oblicz”).</div>
        </div>
      `;

    resultBox.innerHTML = `
      <div class="an-grid">
        <div class="an-card">
          <div class="an-section-title">Wyniki wskaźników</div>
          <div class="an-list">${indicatorRows}</div>
        </div>

        <div>
          ${valuationHTML}
        </div>
      </div>
    `;
  }

  // =========================
  // SAVE PRESET (DEBUG)
  // =========================
  saveButton?.addEventListener("click", () => {
    updateCheckboxes();

    const presetName = document.getElementById("preset-name")?.value.trim();
    const timeframe = document.getElementById("timeframe")?.value;

    console.log("SAVE PRESET:", {
      presetName,
      timeframe,
      mvrv,
      nupl,
      rsi,
      zscore,
      longShort,
      fearGreed,
    });
  });

  // =========================
  // OBLICZ
  // =========================
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    updateCheckboxes();

    const timeframe = document.getElementById("timeframe")?.value || "7D";

    // reset stanu analizy
    analysisResult = {
      meta: {
        timeframe,
        createdAt: new Date().toISOString(),
      },
      indicators: {},
    };

    // loader prosty
    resultBox.innerHTML = `
      <div class="an-card">
        <div class="an-section-title">Analiza w toku…</div>
        <div class="an-muted">Pobieram dane dla wybranych wskaźników i wyliczam market valuation.</div>
      </div>
    `;

    // =========================
    // MVRV
    // =========================
    if (mvrv) {
      try {
        const res = await fetch("/api/mvrv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeframe }),
        });
        const data = await res.json();

        analysisResult.indicators.mvrv = {
          value: data.value,
          marketCap: data.marketCapUSD,
          realizedCap: data.realizedCapUSD,
        };
      } catch {
        analysisResult.indicators.mvrv = { error: true };
      }
    }

    // =========================
    // NUPL
    // =========================
    if (nupl) {
      try {
        const res = await fetch("/api/nupl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeframe }),
        });
        const data = await res.json();

        analysisResult.indicators.nupl = {
          value: data.value,
          marketCap: data.marketCapUSD,
          realizedCap: data.realizedCapUSD,
        };
      } catch {
        analysisResult.indicators.nupl = { error: true };
      }
    }

    // =========================
    // RSI
    // =========================
    if (rsi) {
      try {
        const res = await fetch("/api/rsi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeframe }),
        });
        const data = await res.json();

        analysisResult.indicators.rsi = {
          value: data.value,
          period: data.period,
          signal: data.signal,
        };
      } catch {
        analysisResult.indicators.rsi = { error: true };
      }
    }

    // =========================
    // Z-SCORE
    // =========================
    if (zscore) {
      try {
        const res = await fetch("/api/zscore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeframe }),
        });
        const data = await res.json();

        analysisResult.indicators.zscore = {
          value: data.value,
          price: data.currentPrice,
          mean: data.meanPrice,
          stdDev: data.stdDev,
          zone: data.zone,
        };
      } catch {
        analysisResult.indicators.zscore = { error: true };
      }
    }

    // =========================
    // LONG / SHORT
    // =========================
    if (longShort) {
      try {
        const res = await fetch("/api/longshort", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeframe }),
        });
        const data = await res.json();

        analysisResult.indicators.longShort = {
          zScore: data.zScore,
          currentRatio: data.currentRatio,
          mean: data.mean,
          stdDev: data.stdDev,
          zone: data.zone,
        };
      } catch {
        analysisResult.indicators.longShort = { error: true };
      }
    }

    // =========================
    // FEAR & GREED
    // =========================
    if (fearGreed) {
      try {
        const res = await fetch("/api/feargreed", { method: "POST" });
        const data = await res.json();

        analysisResult.indicators.fearGreed = {
          value: data.value,
          zScore: data.zScore,
          zone: data.zone,
        };
      } catch {
        analysisResult.indicators.fearGreed = { error: true };
      }
    }

    // =========================
    // MARKET VALUATION (z całego state)
    // =========================
    try {
      const res = await fetch("/api/marketvaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisResult),
      });

      const valuation = await res.json();
      analysisResult.marketValuation = valuation;
    } catch {
      analysisResult.marketValuation = { error: true };
    }

    // Final render
    renderAnalysis(analysisResult);

    // Debug
    console.log("FINAL ANALYSIS RESULT:", analysisResult);
  });

  // init
  renderEmpty();
  updateCheckboxes();
});
