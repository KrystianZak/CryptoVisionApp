const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routing
const pageRoutes = require('./routes/pageRoutes');
const apiRoutes = require('./routes/apiRoutes');

app.use('/', pageRoutes);
app.use('/api', apiRoutes);

// Obsługa 404
app.use((req, res) => {
  res.status(404).send('404 - Strona nie istnieje');
});

// Start serwera
app.listen(PORT, () => {
  console.log(`✅ Serwer działa na http://localhost:${PORT}`);
});
