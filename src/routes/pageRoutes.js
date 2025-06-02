const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.getHomePage);
router.get('/visualiser', pageController.getPortfolioPage);

module.exports = router;
