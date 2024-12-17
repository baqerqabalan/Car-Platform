const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisementController');

router.get('/getAds', advertisementController.getAd);

module.exports = router;