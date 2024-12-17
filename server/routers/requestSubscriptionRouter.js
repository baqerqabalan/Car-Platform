const express = require("express");
const router = express.Router();
const multer = require("multer");
const userController = require("../controllers/authController");
const requestSubscriptionController = require("../controllers/requestSubscriptionsController");

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Directory where images will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Avoids naming conflicts
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

// Route with multer middleware
router.post(
  "/requestSubscription",
  userController.protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  requestSubscriptionController.requestSubscription
);

router.get(
  "/checkPreviousRequest",
  userController.protect,
  requestSubscriptionController.checkPreviousRequest
);
router.get("/getProposals", requestSubscriptionController.getApprovedProposals);
router.get(
  "/getProposalById/:proposalId",
  userController.protect,
  requestSubscriptionController.getProposalById
);
router.patch(
  "/updateSubscriptionDetails/:proposalId",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  userController.protect,
  requestSubscriptionController.updateSubscriptionDetails
);

module.exports = router;
