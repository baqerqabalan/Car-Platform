const express = require('express');
const router = express.Router();
const votingsController = require('../controllers/votingsController');
const userController = require('../controllers/authController');

router.post('/addVote/:answerId', userController.protect, votingsController.addVote);

module.exports = router;