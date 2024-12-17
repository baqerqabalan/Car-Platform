const express = require('express');
const router = express.Router();
const userController = require('../Controllers/authController');
const chartController = require('../Controllers/chartController');

router.get('/activityData', userController.protect, chartController.getActivity);

module.exports = router;