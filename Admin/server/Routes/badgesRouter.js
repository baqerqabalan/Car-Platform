const  badgesController = require('../Controllers/badgesController');
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/authController');


router.get('/getEarnedBadges', badgesController.getEarnedUserBadges);
router.post('/createBadge', userController.protect, badgesController.create);
router.patch('/updateBadge/:badgeId', userController.protect, badgesController.update);
router.delete('/deleteBadge/:badgeId', userController.protect, badgesController.delete);
router.get('/getAllUsers', userController.protect, badgesController.getAllUsers);
router.get('/getAllBadges', userController.protect, badgesController.getAllBadges);

module.exports = router;