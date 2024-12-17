const express = require('express');
const router = express.Router();
const salesController = require('../Controllers/salesController');
const userController = require('../Controllers/authController');

router.get('/getAuctionSales', userController.protect, salesController.getAuctionSales);
router.get('/getNormalSales', userController.protect, salesController.getNormalSales);
router.get('/getSellerInfo/:sellerId', userController.protect, salesController.getSellerInfo);
router.get('/getBuyerInfo/:buyerId', userController.protect, salesController.getBuyerInfo);

module.exports = router;
