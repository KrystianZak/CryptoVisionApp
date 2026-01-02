document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("portfolio-form");
  const coinsSelect = document.getElementById("coins");
  const percentagesContainer = document.getElementById("percentages-container");
  const resultDiv = document.getElementById("portfolio-result");

  const sumPill = document.getElementById("sum-pill");
  const remainingPill = document.getElementById("remaining-pill");
  const alertBox = document.getElementById("form-alert");
  const submitBtn = document.getElementById("submit-btn");
  const autoSplitBtn = document.getElementById("auto-split");
  const clearBtn = document.getElementById("clear-storage");

  const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  // ====== Persistence ======
  const STORAGE_KEY = "cryptovision_visualiser_state_v1";

  function saveState() {
    try {
      const capital = document.getElementById("capital")?.value ?? "";
      const selectedCoins = Array.from(coinsSelect.selectedOptions).map((o) => o.value);

      const percents = {};
      selectedCoins.forEach((coin) => {
        const input = document.getElementById(`percent-${coin}`);
        percents[coin] = input?.value ?? "";
      });

      const state = {
        capital,
        selectedCoins,
        percents,
        resultHTML: resultDiv?.innerHTML ?? "",
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage może być zablokowany - ignorujemy
    }
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignorujemy
    }
  }

  // ====== UI helpers ======
  function showAlert(message, type = "error") {
    alertBox.classList.remove("cv-alert--hidden", "cv-alert--error", "cv-alert--success", "cv-alert--info");
    alertBox.classList.add(
      type === "success" ? "cv-alert--success" : type === "info" ? "cv-alert--info" : "cv-alert--error"
    );
    alertBox.textContent = message;
  }

  function hideAlert() {
    alertBox.classList.add("cv-alert--hidden");
    alertBox.textContent = "";
    alertBox.classList.remove("cv-alert--error", "cv-alert--success", "cv-alert--info");
  }

  function getSelectedCoins() {
    return Array.from(coinsSelect.selectedOptions).map((o) => o.value);
  }

  function readAllocations() {
    const selectedCoins = getSelectedCoins();
    let totalPercent = 0;
    const allocations = [];

    selectedCoins.forEach((coin) => {
      const input = document.getElementById(`percent-${coin}`);
      const val = input ? parseFloat(input.value) : NaN;
      const percent = Number.isFinite(val) ? val : 0;
      totalPercent += percent;
      allocations.push({ coin, percent });
    });

    return { totalPercent, allocations };
  }

  function updatePills() {
    const { totalPercent } = readAllocations();
    const rounded = Math.round(totalPercent * 100) / 100;
    const remaining = Math.round((100 - totalPercent) * 100) / 100;

    sumPill.textContent = `Suma: ${rounded}%`;
    remainingPill.textContent = `Pozostało: ${remaining}%`;

    sumPill.classList.remove("cv-pill--neutral", "cv-pill--good", "cv-pill--bad");
    remainingPill.classList.remove("cv-pill--neutral", "cv-pill--good", "cv-pill--bad");

    if (rounded === 100) {
      sumPill.classList.add("cv-pill--good");
      remainingPill.classList.add("cv-pill--good");
      remainingPill.textContent = `Pozostało: 0%`;
      submitBtn.disabled = false;
      hideAlert();
    } else {
      submitBtn.disabled = true;
      const bad = rounded > 100;
      sumPill.classList.add(bad ? "cv-pill--bad" : "cv-pill--neutral");
      remainingPill.classList.add(bad ? "cv-pill--bad" : "cv-pill--neutral");
      showAlert(
        bad
          ? `Suma przekracza 100% (obecnie: ${rounded}%). Zmniejsz wartości.`
          : `Suma musi wynosić 100% (obecnie: ${rounded}%).`,
        "info"
      );
    }
  }

  function buildAllocationInputs() {
    percentagesContainer.innerHTML = "";
    hideAlert();
    submitBtn.disabled = true;

    const selectedCoins = getSelectedCoins();

    if (selectedCoins.length === 0) {
      updatePills();
      saveState();
      return;
    }

    selectedCoins.forEach((coin) => {
      const row = document.createElement("div");
      row.className = "cv-alloc-row";
      row.innerHTML = `
        <div class="cv-alloc-asset">
          <div class="cv-asset-badge">${coin}</div>
          <div class="cv-asset-name">${coin}</div>
        </div>

        <div class="cv-alloc-input">
          <input
            type="number"
            id="percent-${coin}"
            name="percent-${coin}"
            min="0"
            max="100"
            step="0.01"
            placeholder="0"
            required
          />
          <span class="cv-alloc-suffix">%</span>
        </div>
      `;

      percentagesContainer.appendChild(row);

      const input = row.querySelector(`#percent-${coin}`);

      input.addEventListener("input", () => {
        updatePills();
        saveState();
      });

      input.addEventListener("blur", () => {
        const v = parseFloat(input.value);
        if (!Number.isFinite(v)) input.value = "";
        else input.value = (Math.round(v * 100) / 100).toString();
        updatePills();
        saveState();
      });
    });

    updatePills();
    saveState();
  }

  function autoSplit() {
    const selectedCoins = getSelectedCoins();
    if (selectedCoins.length === 0) {
      showAlert("Najpierw wybierz co najmniej jedno aktywo.", "error");
      return;
    }
    hideAlert();

    const base = Math.floor((100 / selectedCoins.length) * 100) / 100;
    const sum = base * selectedCoins.length;
    const diff = Math.round((100 - sum) * 100) / 100;

    selectedCoins.forEach((coin, idx) => {
      const input = document.getElementById(`percent-${coin}`);
      if (!input) return;

      let value = base;
      if (idx === 0 && diff !== 0) value = Math.round((base + diff) * 100) / 100;

      input.value = value.toString();
    });

    updatePills();
    saveState();
  }

  function renderResult(capital, allocations) {
    const sorted = allocations
      .map((a) => ({ ...a, percent: Math.round(a.percent * 100) / 100 }))
      .sort((a, b) => b.percent - a.percent);

    const total = sorted.reduce((acc, a) => acc + a.percent, 0);
    const top = sorted[0]?.coin ?? "-";

    const rows = sorted
      .map((a) => {
        const amount = (capital * a.percent) / 100;
        return `
          <tr>
            <td class="cv-td-asset">
              <span class="cv-asset-pill">${a.coin}</span>
            </td>
            <td>${a.percent.toFixed(2)}%</td>
            <td>${fmtUSD.format(amount)}</td>
          </tr>
        `;
      })
      .join("");

    const bars = sorted
      .map((a) => {
        return `
          <div class="cv-bar-row">
            <div class="cv-bar-label">${a.coin}</div>
            <div class="cv-bar-track">
              <div class="cv-bar-fill" style="width:${Math.max(0, Math.min(100, a.percent))}%"></div>
            </div>
            <div class="cv-bar-val">${a.percent.toFixed(2)}%</div>
          </div>
        `;
      })
      .join("");

    resultDiv.innerHTML = `
      <div class="cv-summary">
        <div class="cv-summary-card">
          <div class="cv-summary-label">Kapitał</div>
          <div class="cv-summary-value">${fmtUSD.format(capital)}</div>
        </div>
        <div class="cv-summary-card">
          <div class="cv-summary-label">Suma alokacji</div>
          <div class="cv-summary-value">${total.toFixed(2)}%</div>
        </div>
        <div class="cv-summary-card">
          <div class="cv-summary-label">Największy udział</div>
          <div class="cv-summary-value">${top}</div>
        </div>
      </div>

      <div class="cv-result-section">
        <h3 class="cv-section-title">Wizualizacja alokacji</h3>
        <div class="cv-bars">${bars}</div>
      </div>

      <div class="cv-result-section">
        <h3 class="cv-section-title">Tabela docelowych kwot</h3>
        <div class="cv-table-wrap">
          <table class="cv-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Target Allocation</th>
                <th>Target Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ====== Events ======

  const capitalInput = document.getElementById("capital");
  if (capitalInput) {
    capitalInput.addEventListener("input", saveState);
    capitalInput.addEventListener("blur", saveState);
  }

  coinsSelect.addEventListener("change", () => {
    buildAllocationInputs();
    saveState();
  });

  autoSplitBtn.addEventListener("click", autoSplit);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const capital = parseFloat(document.getElementById("capital").value);
    if (!Number.isFinite(capital) || capital <= 0) {
      showAlert("Podaj poprawny kapitał większy od 0.", "error");
      return;
    }

    const { totalPercent, allocations } = readAllocations();
    const rounded = Math.round(totalPercent * 100) / 100;

    if (rounded !== 100) {
      showAlert(`Suma procentów musi wynosić 100% (obecnie: ${rounded}%).`, "error");
      return;
    }

    hideAlert();
    showAlert("Gotowe — wyliczono docelowe kwoty portfela.", "success");
    renderResult(capital, allocations);
    saveState();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const ok = confirm(
        "Czy na pewno chcesz wyczyścić zapisane dane Visualisera?\n\nKapitał, alokacje i wynik zostaną usunięte."
      );
      if (!ok) return;

      // 1) usuń zapis
      clearState();

      // 2) reset formularza i UI
      form.reset();
      percentagesContainer.innerHTML = "";
      submitBtn.disabled = true;
      hideAlert();

      sumPill.textContent = "Suma: 0%";
      remainingPill.textContent = "Pozostało: 100%";
      sumPill.className = "cv-pill cv-pill--neutral";
      remainingPill.className = "cv-pill cv-pill--neutral";

      // 3) pusty wynik
      resultDiv.innerHTML = `
        <div class="cv-empty">
          <div class="cv-empty__icon">📊</div>
          <div class="cv-empty__title">Brak danych do wyświetlenia</div>
          <div class="cv-empty__text">Dane zostały wyczyszczone. Wprowadź nowe wartości, aby rozpocząć.</div>
        </div>
      `;

      // UWAGA: nie wywołujemy saveState() tutaj — bo to by znowu zapisało pusty wynik.
    });
  }

  // ====== init (restore state) ======
  const state = loadState();

  // najpierw zbuduj UI bez stanu
  buildAllocationInputs();

  // potem przywróć
  if (state) {
    if (capitalInput && typeof state.capital === "string") {
      capitalInput.value = state.capital;
    }

    if (Array.isArray(state.selectedCoins)) {
      Array.from(coinsSelect.options).forEach((opt) => {
        opt.selected = state.selectedCoins.includes(opt.value);
      });
    }

    buildAllocationInputs();

    if (state.percents && typeof state.percents === "object") {
      Object.entries(state.percents).forEach(([coin, value]) => {
        const input = document.getElementById(`percent-${coin}`);
        if (input) input.value = value ?? "";
      });
    }

    if (typeof state.resultHTML === "string" && state.resultHTML.trim().length > 0) {
      resultDiv.innerHTML = state.resultHTML;
    }

    updatePills();
  }

  // final save
  saveState();
});
