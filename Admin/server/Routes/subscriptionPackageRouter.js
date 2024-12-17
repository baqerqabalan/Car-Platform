const express = require('express');
const router = express.Router();
const packageController = require('../Controllers/subscriptionPackagesController');
const userController = require('../Controllers/authController');

router.post('/create', userController.protect, packageController.createSubscriptionPackage);
router.patch('/update/:packageId', userController.protect ,packageController.updateSubscriptionPackage);
router.delete('/delete/:packageId', userController.protect, packageController.deleteSubscriptionPackage);
router.get('/getAllPackages', userController.protect, packageController.getSubscriptionPackages);

module.exports = router;