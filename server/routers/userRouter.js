const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');


// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads'); // Directory where images will be saved
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // Avoids naming conflicts
    },
  });
  
  // Initialize multer with the storage configuration
  const upload = multer({ storage });


router.post('/signup', upload.single('profileImg'), authController.signup);
router.post('/login', authController.login);
router.patch('/updatePassword', authController.protect, authController.updatePassword);
router.patch('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token',  authController.resetPassword);
router.get('/verifyToken/:token', authController.verifyToken);
router.get('/getProfileImg', authController.protect, userController.getProfileImg);
router.get('/getUser/:userId', authController.protect, userController.getUser);
router.patch('/updateProfileImg', authController.protect, upload.single('profileImg'), userController.updateProfileImg);
router.patch('/updateUserInfo', authController.protect, userController.updateProfileInfo);
router.get('/getUserInfo', authController.protect, userController.getUserInfo);

module.exports = router;