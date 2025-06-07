const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

//Sesja użytkownika
const session = require('express-session');

app.use(session({
  secret: 'tajny_klucz_sesji',
  resave: false,
  saveUninitialized: false,
}));

// Middleware
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routing – API + logowanie
const authRoutes = require('./routes/authRoutes');
const pageRoutes = require('./routes/pageRoutes');
const apiRoutes = require('./routes/apiRoutes');

app.use('/api', authRoutes);
app.use('/api', apiRoutes);
app.use('/', pageRoutes);

// Widok logowania (HTML)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/login.html'));
});

// Obsługa 404
app.use((req, res) => {
  res.status(404).send('404 - Strona nie istnieje');
});

// Start serwera
app.listen(PORT, () => {
  console.log(`✅ Serwer działa na http://localhost:${PORT}`);
});
