const express = require('express');
const router = express.Router();
const questionController = require('../Controllers/questionsController');
const userController = require('../Controllers/authController');


router.get('/getAllQuestions', userController.protect, questionController.getAllQuestions);
router.get('/getAllAnswers/:questionId', userController.protect, questionController.getAllAnswers);
router.get('/getAllVotings/:answerId', userController.protect, questionController.getAllVoters);
module.exports = router;