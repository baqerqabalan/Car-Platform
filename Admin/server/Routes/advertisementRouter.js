const multer = require("multer");
const path = require("path");
const router = require("express").Router();
const userController = require("../Controllers/authController");
const advertisementController = require("../Controllers/advertisementController");

// Multer storage for initial file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Temporary upload directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
router.post(
  "/create-advertisement",
  upload.fields([
    { name: "model", maxCount: 1 },
    { name: "audios[horn]", maxCount: 1 },
    { name: "audios[engine]", maxCount: 1 },
    { name: "audios[boost]", maxCount: 1 },
  ]),
  userController.protect,
  advertisementController.createAdvertisement
);

router.get("/getAds", userController.protect, advertisementController.getAllAds);
router.get("/getProducts", userController.protect, advertisementController.getProducts);
router.patch('/updateAdStatus', userController.protect, advertisementController.updateAdStatus);
router.get('/getTotalPublished', userController.protect, advertisementController.getTotalPublished);

module.exports = router;