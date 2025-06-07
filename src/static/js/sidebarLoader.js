document.addEventListener("DOMContentLoaded", () => {
  fetch('/partials/sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;

      const currentPath = window.location.pathname;
      document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === currentPath) {
          item.classList.add('active');
        }
      });

      const toggleBtn = document.getElementById('toggleSidebar');
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content');

      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
          sidebar.classList.toggle('open');

          if (mainContent) {
            mainContent.style.marginLeft = sidebar.classList.contains('open') ? '220px' : '80px';
          }
        });
      }
    })
    .catch(error => console.error('Błąd ładowania sidebaru:', error));
});
