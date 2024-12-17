const express = require('express');
const router = express.Router();
const messageController = require('../Controllers/messagesController');
const userController = require('../Controllers/authController');

router.get('/getPendingMessages', userController.protect, messageController.getPendingMessages);
router.get('/getResolvedMessages', userController.protect, messageController.getResolvedMessages);
router.post('/sendMessage', userController.protect, messageController.sendMessage);
router.get('/getTotalMessages', userController.protect, messageController.getTotalMessages);

module.exports = router;