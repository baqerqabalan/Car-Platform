const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const userController = require('../controllers/authController');

router.post('/createAnswer/:questionId', userController.protect, answerController.create);
router.patch('/updateAnswer/:answerId', userController.protect, answerController.update);
router.delete('/deleteAnswer/:answerId', userController.protect, answerController.delete);
router.get('/getQuestionsInfo/:questionId',  userController.protect, answerController.getQuestionsInfo);
router.get('/getQuestion/:questionId', answerController.getQuestion);

module.exports = router;