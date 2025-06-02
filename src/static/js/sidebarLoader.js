document.addEventListener("DOMContentLoaded", () => {
    fetch('/partials/sidebar.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('sidebar').innerHTML = data;
      })
      .catch(error => console.error('Błąd ładowania sidebaru:', error));
  });
  