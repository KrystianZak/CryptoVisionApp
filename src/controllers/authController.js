const jwt = require('jsonwebtoken');
const SECRET = 'tajne_haslo';

const login = (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@example.com' && password === '1234') {
    req.session.loggedIn = true; // <=== zapis do sesji
    res.redirect('/');

  }

  if (email === 'admin@example.com' && password === '1234') {
  req.session.loggedIn = true;

  console.log('Sesja po zalogowaniu:', req.session);

  return res.redirect('/');
}

  res.status(401).send('Błędny login lub hasło');
};

module.exports = { login };
