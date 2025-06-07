const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// Middleware chroniący dostęp
function requireLogin(req, res, next) {
  if (req.session && req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Chroniony dostęp do strony głównej
router.get('/', requireLogin, pageController.getHomePage);

// Chroniony dostęp do wizualizera
router.get('/visualiser', requireLogin, pageController.getPortfolioPage);

module.exports = router;
