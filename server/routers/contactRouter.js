const express = require('express');
const contactController = require('../controllers/contactController');
const userController = require('../controllers/authController');
const router = express.Router();


router.post('/contact', userController.protect, contactController.createContact);

module.exports = router;