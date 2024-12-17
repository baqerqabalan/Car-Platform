const express = require('express');
const activityController = require('../Controllers/recentActivityController');
const userController = require('../Controllers/authController');
const router = express.Router();

router.get('/getActivity', userController.protect, activityController.Activity);

module.exports = router;