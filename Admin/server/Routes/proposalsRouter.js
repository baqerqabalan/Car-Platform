const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const proposalsController = require('../Controllers/proposalsController');
const userController = require('../Controllers/authController');

// Set up multer storage with custom destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Directory where images will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Avoids naming conflicts
  },
});

// Initialize multer with the custom storage
const upload = multer({ storage });

// Define routes
router.get('/getProposals', userController.protect, proposalsController.getMechanicProposals);
router.patch('/updateProposal', upload.single('recieptImg'), userController.protect, proposalsController.updateStatus);
router.get('/getRequestTotal', userController.protect, proposalsController.getTotalRequests);

module.exports = router;