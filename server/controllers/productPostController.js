const Product = require("../models/productPostModel");
const Auction = require("../models/auctionModel");
const Bid = require("../models/bidModel");
const mongoose = require("mongoose");

exports.create = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      is_auction,
      auction_end_date,
      category,
      confirmUserInfo,
      agreeToTerms,
      address,
    } = req.body;
    const sellerId = req.user._id;

    // Ensure there's a main image uploaded
    if (!req.files || !req.files.image || req.files.image.length === 0) {
      return res.status(400).json({ message: "Main image is required" });
    }

    const image = req.files.image[0].path; // Main image path
    const imagesArray = req.files.additionalImages
      ? req.files.additionalImages.map((file) => file.path)
      : []; // Additional images

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate auction end date if the product is an auction
    if (
      is_auction === true &&
      (!auction_end_date || new Date(auction_end_date) <= new Date())
    ) {
      return res.status(400).json({ message: "Invalid auction end date" });
    }

    // Create the new product
    const newProduct = await Product.create({
      name,
      description,
      price,
      image, // Main image
      images: imagesArray, // Additional images
      is_auction,
      auction_start_date: Date.now(),
      auction_end_date,
      sellerId,
      category,
      status: "active",
      confirmUserInfo,
      agreeToTerms,
      address,
    });

    // Create auction only if the product is for auction
    if (newProduct.is_auction) {
      await Auction.create({
        productId: newProduct._id,
        highestBidder: null,
        highestBid: newProduct.price,
        status: "active",
      });
    }

    return res.status(201).json({
      message: "Product Created Successfully",
      data: { post: newProduct },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.update = async (req, res) => {
  try {
    const productId = req.params.productID;
    const {
      name,
      description,
      price,
      is_auction,
      auction_start_date,
      auction_end_date,
      category,
      address,
      deletedImages, // List of image paths to delete
    } = req.body;
    
    // Get the path of the uploaded main image, if available
    const image = req.files && req.files.image ? req.files.image[0].path : null; // Main image
    const newImages =
      req.files && req.files.images
        ? req.files.images.map((file) => file.path)
        : []; // New additional images

    // 1. Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2. Update basic product fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (image) product.image = image; // Update main image if provided
    if (address) product.address = address;
    if (typeof is_auction !== "undefined") product.is_auction = is_auction;
    if (category) product.category = category;

    if (auction_start_date !== undefined && auction_start_date !== null) {
      product.auction_start_date = auction_start_date;
    } else {
      product.auction_start_date = undefined; // Or delete the field if necessary
    }

    if (auction_end_date !== undefined && auction_end_date !== null) {
      product.auction_end_date = auction_end_date;
    } else {
      product.auction_end_date = undefined; // Or delete the field if necessary
    }

    // 3. Handle additional images

    // Remove deleted images from the product's images array
    if (deletedImages && deletedImages.length > 0) {
      product.images = product.images.filter(
        (img) => !deletedImages.includes(img)
      );
    }

    // Add new images to the existing ones
    if (newImages.length > 0) {
      product.images = product.images.concat(newImages); // Append new images to the existing array
    }

    if(is_auction === "true"){
      await Auction.create({
        productId,
        highestBidder: null,
        highestBid: product.price,
        status: "active",
      });
    }else{
      const auction = await Auction.findOne({productId});
      if(auction){
        await auction.deleteOne();
      }
    }

    // 4. Save the updated product
    const updatedProduct = await product.save();
    return res.status(200).json({
      message: "Product Updated Successfully",
      data: { product: updatedProduct },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.delete = async (req, res) => {
  try {
    const productId = req.params.productID;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    return res.status(200).json({ message: "Product Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Validate productId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    // 1. Fetch the product
    const product = await Product.findById(productId).populate(
      "sellerId",
      "firstName lastName profileImg"
    );

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    let auction = null;
    let biddingHistory = [];

    // 2. Check if it's an auction
    if (product.is_auction) {
      // Fetch the auction based on the product ID
      auction = await Auction.findOne({ productId: productId });

      if (auction) {
        // 3. Fetch bidding history based on auctionId and populate user info
        biddingHistory = await Bid.find({ auctionId: auction._id })
          .populate("userId", "firstName lastName profileImg")
          .sort({ createdAt: -1 });
      }
    }

    // 4. Return the product, auction, and bidding history
    return res.status(200).json({ product, auction, biddingHistory });
  } catch (error) {
    console.error("Error fetching product details:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getNormalSaleProducts = async (req, res) => {
  try{
    const products = await Product.find({status:"active", is_auction:"false"}).populate("sellerId", "firstName lastName profileImg");

    return res.status(200).json({products});
  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Something went wrong"});
  }
}