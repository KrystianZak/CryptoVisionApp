const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Logowanie użytkownika
router.post('/login', login);

// Wylogowanie użytkownika
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Błąd podczas wylogowywania.');
    }
    res.redirect('/login');
  });
});

module.exports = router;
