const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const userController = require('../controllers/authController');

router.post('/createSale/:productId', userController.protect, salesController.createSale);
router.get('/createSalePdf/:productId', userController.protect, salesController.createReservationBill);
router.get('/checkSale/:productId', userController.protect, salesController.checkSale);

module.exports = router;