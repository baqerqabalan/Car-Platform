const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const userController = require('../controllers/authController');
const questionFilterController = require('../controllers/questionFilters');

router.post('/createQuestion', userController.protect, questionController.create);
router.patch('/updateQuestion/:questionId', userController.protect, questionController.update);
router.delete('/deleteQuestion/:questionId', userController.protect, questionController.delete);
router.get('/getTopAnsweredQuestions', questionController.getTopAnswersForFAQ);
router.get('/getQuestionCounter', questionController.getQuestionCounter);
router.get('/getAllQuestions', questionController.getAllQuestions);
router.get('/', questionFilterController.filteredAndSortedQuestions);

module.exports = router;