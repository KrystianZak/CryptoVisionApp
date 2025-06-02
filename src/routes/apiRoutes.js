const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/crypto', apiController.getCryptoData);

module.exports = router;
