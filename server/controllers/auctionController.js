const cron = require("node-cron");
const Product = require("../models/productPostModel");
const User = require("../models/userModel");
const Auction = require("../models/auctionModel");
const Bid = require("../models/bidModel");
const { sendEmail, sendEmailWithUrl } = require("../utils/email");

exports.bid = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user._id;
    const bidding_price = req.body.bidAmount;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure the product is available for auction
    if (!product.is_auction) {
      return res.status(400).json({ message: "Product is not up for auction" });
    }

    // Check if there's an active auction for this product
    const existingAuction = await Auction.findOne({ productId });
    if (!existingAuction) {
       return res.status(404).json({message:"Auction Not Found"});
    }

    // Check if the new bid is higher than the current highest bid
    if (existingAuction.highestBid >= bidding_price) {
      return res.status(400).json({
        message: "Your bid must be higher than the current highest bid",
      });
    }

    // Ensure the bid is higher than the original price of the product
    if (product.price >= bidding_price) {
      return res
        .status(400)
        .json({ message: "Your bid must be higher than the original price" });
    }

    // Update previous bids to 'lose'
    await Bid.updateMany(
      { auctionId: existingAuction._id, userId: { $ne: userId } }, // Update all previous bids except the current user's
      { $set: { result: "lose" } }
    );

    // Save the new bid in the bid history
    const newBid = await Bid.create({
      auctionId: existingAuction._id,
      userId: userId,
      bidAmount: bidding_price,
      result: "win",
    });

    if (newBid) {
      // Update the auction with the new highest bid and bidder
      existingAuction.highestBid = bidding_price;
      existingAuction.highestBidder = userId;
      await existingAuction.save();
    }

    return res.status(201).json({
      message: "New Bid added",
      data: { auction: existingAuction, bid: newBid },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.updateBid = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user._id;
    const bidding_price = req.body.bidAmount;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product is up for auction
    if (!product.is_auction) {
      return res.status(400).json({ message: "Product is not up for auction" });
    }

    // Find the auction associated with this product
    const auction = await Auction.findOne({ productId });
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Check if the user already placed a bid and ensure the new bid is higher
    const previousBid = await Bid.findOne({ auctionId: auction._id, userId });
    if (previousBid && bidding_price <= previousBid.bidAmount) {
      return res.status(400).json({
        message: "Your new bid must be higher than your previous bid",
      });
    } else if (!previousBid && bidding_price <= auction.highestBid) {
      return res.status(400).json({
        message: "Bid must be higher than the current highest bid",
      });
    }

    // Create a new bid
    const newBid = new Bid({
      auctionId: auction._id,
      productId,
      userId,
      bidAmount: bidding_price, // Use 'bidAmount' consistently
      result: "win", // This bid will be the winning bid for now
    });
    await newBid.save();

    // Update previous bids (except the current user's) to 'lose'
    await Bid.updateMany(
      { auctionId: auction._id, userId: { $ne: userId } },
      { $set: { result: "lose" } }
    );

    // Update the auction details with the highest bid and bidder
    auction.highestBid = bidding_price;
    auction.highestBidder = userId;
    await auction.save();

    return res
      .status(200)
      .json({ message: "Bid placed successfully", data: { auction, newBid } });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Something went wrong: ${error.message}` });
  }
};

cron.schedule("* * * * *", async () => {
  const now = new Date();

  try {
    // 1. Find products that are on auction and have ended
    const endedProducts = await Product.find({
      is_auction: true,
      auction_end_date: { $lte: now },
    });

    // Extract product IDs
    const endedProductIds = endedProducts.map((product) => product._id);

    // 2. Find active auctions for these products
    const endedAuctions = await Auction.find({
      status: "active",
      productId: { $in: endedProductIds },
    });

    for (const auction of endedAuctions) {
      auction.status = "inactive";

      // Update the product status to inactive
      await Product.findByIdAndUpdate(auction.productId, {
        status: "inactive",
      });

      // Get product information to send notifications
      const product = await Product.findById(auction.productId);

      if (!product) {
        console.error(`Product with ID ${auction.productId} not found.`);
        continue;
      }

      // Get the highest bidder information
      const highestBidder = await User.findById(auction.highestBidder);

      if (!highestBidder) {
        console.error(`Highest Bidder not found for auction ${auction._id}.`);
        continue;
      }

      // Get the seller information
      const seller = await User.findById(product.sellerId);

      if (!seller) {
        console.error(`Seller not found for product ${product._id}.`);
        continue;
      }

      // Notify the highest bidder
      try {
        const checkoutUrl = `http://localhost:3000/Market Place/Checkout/${product._id}`;

        const emailOptions = {
          email: highestBidder.email, // Send to the seller's email
          subject: "Auction Ended",
          message: `Congratulations! You won the auction for the product "${product.name}" with a bid of $${auction.highestBid}. Please complete the purchase here: ${checkoutUrl}`,
          dynamicUrl: checkoutUrl
        };
        await sendEmailWithUrl(emailOptions);
      } catch (emailError) {
        console.error(
          `Error sending notification to the highest bidder: ${emailError.message}`
        );
      }

      // Notify the seller
      try {
        const emailOptions = {
          email: seller.email, // Send to the seller's email
          subject: "Auction Ended",
          message: `Your product "${product.name}" has been sold to ${highestBidder.firstName} ${highestBidder.lastName} for $${auction.highestBid}.`,
        };

        await sendEmail(emailOptions);
      } catch (emailError) {
        console.error(
          `Error sending notification to the seller: ${emailError.message}`
        );
      }

      // Save the auction with the updated status
      await auction.save();
    }
  } catch (error) {
    console.error("Error ending auctions:", error);
  }
});
