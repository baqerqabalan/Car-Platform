const express = require('express');
const router = express.Router();
const userController = require('../controllers/authController');
const auctionController = require('../controllers/auctionController');
const infoController = require('../controllers/userController');


router.post('/bid/:productId', userController.protect, auctionController.bid);
router.patch('/updateBid/:productId', userController.protect, auctionController.updateBid);
router.get('/getAllAuctions', infoController.getAllAuctions);

module.exports = router;
