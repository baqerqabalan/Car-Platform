const express = require('express');
const router = express.Router();
const cardsController = require('../Controllers/cardsController');

router.get('/getTotalProducts', cardsController.getTotalProducts);
router.get('/getTotalSales', cardsController.getTotalSales);
router.get('/getTotalUsers', cardsController.getTotalUsers);
router.get('/getTotalQuestions', cardsController.getTotalQuestions);

module.exports = router;
