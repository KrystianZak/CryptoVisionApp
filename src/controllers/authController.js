
const login = (req, res) => {
  const { email, password } = req.body;

  if (email === 'krystian.zak@mail.com' && password === '1234') {
    req.session.loggedIn = true;
    console.log('✅ Sesja po zalogowaniu:', req.session);

    return res.redirect('/');
  }

  res.status(401).send('Błędny login lub hasło');
};

module.exports = { login };
