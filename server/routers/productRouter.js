const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/authController');
const productController = require('../controllers/productPostController');
const productFilterController = require('../controllers/productsFilterController');

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

router.post('/create', userController.protect, 
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additionalImages', maxCount: 5}]), 
  productController.create);

router.patch('/update/:productID', userController.protect, 
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 5 }]), 
  productController.update);

  router.delete('/delete/:productID', userController.protect, productController.delete);

  router.get('/', productFilterController.filteredAndSortedProducts);

  router.get('/getProduct/:productId', userController.protect, productController.getProduct);

  router.get('/getNormalSaleProducts', productController.getNormalSaleProducts);
module.exports = router;
