const express = require('express')
const router = express.Router()
const apiController = require('../controllers/apiController')

router.get('/crypto', apiController.getCryptoData)
router.post('/mvrv', apiController.getMVRV)

module.exports = router
