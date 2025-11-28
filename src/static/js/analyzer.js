// static/js/analyzer.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("analyzer-form");
  const resultContainer = document.getElementById("portfolio-result");

  // mapa akcji - możesz zastąpić zwracaniem Promise (async)
  const componentActions = {
    mvrv: async () => {
      console.log("🔵 Liczę MVRV...");
      // przykład async (np. fetch do API) -> możesz to zamienić na sync
      await sleep(120);
      return { name: "MVRV", value: (Math.random() * 0.5 + 0.5).toFixed(2) };
    },

    nupl: async () => {
      console.log("🟣 Liczę NUPL...");
      await sleep(120);
      return { name: "NUPL", value: (Math.random() * 2 - 1).toFixed(2) };
    },

    sharpe: async () => {
      console.log("🟢 Liczę Sharpe Ratio...");
      await sleep(120);
      return { name: "Sharpe Ratio", value: (Math.random() * 3).toFixed(2) };
    },

    totalmarketcap: async () => {
      console.log("🟠 Liczę Total Market Cap...");
      await sleep(120);
      return { name: "Total Market Cap", value: (Math.random() * 1000).toFixed(0) + "B" };
    }
  };

  // helper - małe opóźnienie do demo/imitacji fetch
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1) pobierz zaznaczone checkboxy
    const checked = Array.from(
      document.querySelectorAll('#analyzer-form input[type="checkbox"]:checked')
    ).map(cb => cb.value);

    if (checked.length === 0) {
      // zamiast alert możesz wyświetlić komunikat w DOM
      alert("Zaznacz przynajmniej jeden komponent do analizy.");
      return;
    }

    console.log("Zaznaczone komponenty:", checked);

    // 2) wywołujemy tylko funkcje powiązane z zaznaczonymi komponentami
    // obsługujemy zarówno sync jak i async (Promise)
    const promises = checked.map(key => {
      const fn = componentActions[key];
      if (!fn) {
        console.warn("Brak implementacji dla:", key);
        return Promise.resolve({ name: key, value: "brak implementacji" });
      }
      try {
        return Promise.resolve(fn());
      } catch (err) {
        console.error("Błąd w funkcji komponentu", key, err);
        return Promise.resolve({ name: key, value: "error" });
      }
    });

    // 3) czekamy na wszystkie wyniki
    const results = await Promise.all(promises);

    // 4) renderujemy wynik
    displayResults(results);
  });

  // funkcja renderująca wynik w #portfolio-result
  function displayResults(results) {
    resultContainer.innerHTML = ""; // czyścimy

    // prosty wrapper z responsywnymi boxami
    const wrap = document.createElement("div");
    wrap.className = "analysis-results";

    results.forEach(r => {
      const box = document.createElement("div");
      box.className = "analysis-card";
      box.innerHTML = `
        <h3 class="analysis-title">${escapeHtml(r.name)}</h3>
        <div class="analysis-value">${escapeHtml(String(r.value))}</div>
      `;
      wrap.appendChild(box);
    });

    resultContainer.appendChild(wrap);
  }

  // małe zabezpieczenie przed XSS przy wstawianiu stringów
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
