document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("home-visualiser-result");
  if (!container) return;

  const STORAGE_KEY = "cryptovision_visualiser_state_v1";
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return;

  try {
    const state = JSON.parse(raw);

    if (state?.resultHTML && state.resultHTML.trim().length > 0) {
      container.innerHTML = state.resultHTML;
    }
  } catch (e) {
    console.warn("Nie udało się wczytać danych Visualisera:", e);
  }
});