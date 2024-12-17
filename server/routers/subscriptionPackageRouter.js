const express = require('express');
const router = express.Router();
const packageController = require('../controllers/subscriptionPackagesController');

router.post('/create', packageController.createSubscriptionPackage);
router.patch('/update/:packageId', packageController.updateSubscriptionPackage);
router.delete('/delete/:packageId', packageController.deleteSubscriptionPackage);
router.get('/getSubscriptionPackages', packageController.getSubscriptionPackages);

module.exports = router;