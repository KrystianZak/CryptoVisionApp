const express = require('express')
const router = express.Router()
const apiController = require('../controllers/apiController')

router.get('/crypto', apiController.getCryptoData)
router.post('/mvrv', apiController.getMVRV)
router.post('/nupl', apiController.getNUPL)
router.post('/rsi', apiController.getRSI)
router.post('/zscore', apiController.getZScore)
router.post('/longshort', apiController.getLongShort)
router.post('/feargreed', apiController.getFearGreed)
router.post('/marketvaluation', apiController.getMarketValuation)

module.exports = router
