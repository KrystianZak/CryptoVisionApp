document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const remember = document.getElementById("remember");

  const errorBox = document.getElementById("loginError");
  const btn = document.getElementById("loginBtn");
  const togglePassword = document.getElementById("togglePassword");

  const REMEMBER_KEY = "cryptovision_login_email_v1";

  // restore remembered email
  try {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved && emailInput) {
      emailInput.value = saved;
      if (remember) remember.checked = true;
    }
  } catch {}

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.classList.remove("login-alert--hidden");
  }

  function hideError() {
    if (!errorBox) return;
    errorBox.textContent = "";
    errorBox.classList.add("login-alert--hidden");
  }

  function setLoading(isLoading) {
    if (!btn) return;
    btn.classList.toggle("is-loading", isLoading);
    btn.disabled = isLoading;
  }

  // show/hide password
  if (togglePassword && passInput) {
    togglePassword.addEventListener("click", () => {
      const isPass = passInput.type === "password";
      passInput.type = isPass ? "text" : "password";
      togglePassword.textContent = isPass ? "🙈" : "👁";
      togglePassword.setAttribute("aria-label", isPass ? "Hide password" : "Show password");
    });
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const email = (emailInput?.value || "").trim();
    const password = passInput?.value || "";

    if (!email || !password) {
      showError("Please enter both email and password.");
      return;
    }

    // remember email
    try {
      if (remember?.checked) localStorage.setItem(REMEMBER_KEY, email);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch {}

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Jeżeli backend robi redirect po sukcesie:
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }

      // Jeżeli backend nie robi redirect, spróbuj odczytać status:
      if (!res.ok) {
        showError("Invalid email or password.");
        return;
      }

      // fallback: jeśli ok ale bez redirect
      showError("Login succeeded but server did not redirect. Check backend response.");
    } catch (err) {
      showError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  });
});
