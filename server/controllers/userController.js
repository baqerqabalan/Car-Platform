const User = require("../models/userModel");
const Auction = require("../models/auctionModel");
const Product = require("../models/productPostModel");
const EarnedBadge = require("../models/earnedBadges");
const Badge = require("../models/badgesModel");

exports.getUser = async (req, res) => {
  try {
    const id = req.params.userId;

    // Fetch earned badges for the user
    const earnedBadges = await EarnedBadge.find({ userId: id });

    // Extract badgeId from each earned badge document
    const earnedBadgesIds = earnedBadges.map((badge) => badge.badgeId); // Return the badgeId

    // Find the badges with the corresponding badge IDs
    const badges = await Badge.find({ _id: { $in: earnedBadgesIds } }).select(
      "_id name description"
    );

    // Fetch the user details
    const user = await User.findById(id);

    return res.status(200).json({ data: user, badges });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getProfileImg = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("firstName profileImg");
    res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getAllAuctions = async (req, res) => {
  try {
    const currentDate = new Date();
    const next48Hours = new Date(currentDate.getTime() + 48 * 60 * 60 * 1000);

    // Find products that are on auction
    const products = await Product.find({
      is_auction: true,
      auction_end_date: {
        $gte: currentDate,
        $lte: next48Hours,
      },
    }).select("_id name price image auction_end_date sellerId").populate('sellerId', 'firstName lastName profileImg');

    // If no products are found, return an empty array
    if (products.length === 0) {
      return res.json([]);
    }

    // Get auction details for the found products
    const auctions = await Auction.find({
      productId: { $in: products.map((product) => product._id) },
      status: "active",
    }).select("productId highestBid");


    // Combine auctions and seller information
    const response = {
      auctions: auctions,
      products: products,
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.updateProfileImg = async (req, res) => {
  try {
    const userId = req.user._id;

    // Ensure the file exists before updating the image path
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Get the path of the uploaded file
    const profileImg = req.file.path;

    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's profile image
    user.profileImg = profileImg;

    // Save the updated user document
    await user.save();

    return res
      .status(200)
      .json({ message: "Profile updated successfully", profileImg });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return res.status(500).json({ message: "Error updating profile image" });
  }
};

exports.updateProfileInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    const { firstName, lastName, dob, job, phoneNumber } = req.body;

    user.firstName = firstName;
    user.lastName = lastName;
    user.dob = dob;
    user.job = job;
    user.phoneNumber = phoneNumber;

    await user.save();

    return res.status(200).json({message: "Profile updated successfully"});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getUserInfo = async(req, res) => {
  try{
    const userId = req.user._id;

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"User not Found"});
    }

    return res.status(200).json({ user });
  }catch(error){
    console.log(error);
    return res.status(500).json({mesage:"Something went wrong"});
  }
};