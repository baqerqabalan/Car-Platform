const Sale = require('../../../server/models/salesModel');
const Product = require('../../../server/models/productPostModel');
const User = require('../../../server/models/userModel');
const Auction = require('../../../server/models/auctionModel');
const Bid = require('../../../server/models/bidModel');

exports.getAuctionSales = async (req, res) => {
  try {
    const rowsPerPage = parseInt(req.query.rows) || 5; // Number of items per page
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) - 1 : 0; // Page index, default to 0
    const filter = req.query.filter;
    const search = req.query.search;

    // Create a base query object to apply search and filter conditions
    const query = { is_auction: true };

    // Apply search if provided (searching by product name in this case)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }    

    // Apply filtering based on the `filter` parameter
    if (filter) {
      switch (filter) {
        case "endingSoon":
          // Add custom filter for products ending soon
          query.auction_end_date = { $lt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) }; // Ending within 7 days
          break;
        case "auctionEnded":
          query.auction_end_date = { $lt: new Date() }; // Auctions already ended
          break;
        case "goingAuctions":
          query.auction_end_date = { $gte: new Date() }; // Ongoing auctions
          break;
        default:
          break;
      }
    }

    // Fetch filtered and searched products with pagination
    const products = await Product.find(query)
      .skip(page * rowsPerPage) // Skip based on current page
      .limit(rowsPerPage); // Limit to rows per page

    // Map through each product and fetch its associated details
    const productDetails = await Promise.all(
      products.map(async (product) => {
        // Fetch sale data related to this product
        const sale = await Sale.findOne({ productId: product._id });

        // Fetch seller information
        const sellerUserInfo = await User.findById(product.sellerId).select('_id firstName lastName');

        // Fetch buyer information if a sale is found
        const buyerUserInfo = sale ? await User.findById(sale.userId).select('_id firstName lastName') : null;

        // Fetch auction details related to this product
        const auction = await Auction.findOne({ productId: product._id }).select('_id');

        // Fetch bids related to this auction
        const bids = auction ? await Bid.find({ auctionId: auction._id }) : [];

        // Fetch information for each bidder
        const bidDetails = await Promise.all(
          bids.map(async (bid) => {
            const bidder = await User.findById(bid.userId);
            return {
              ...bid.toObject(),
              bidderFullName: bidder ? `${bidder.firstName} ${bidder.lastName}` : null,
            };
          })
        );

        // Structure and return all details for this product
        return {
          product: product.toObject(),
          sale: sale ? sale.toObject() : null,
          seller: sellerUserInfo ? sellerUserInfo.toObject() : null,
          buyer: buyerUserInfo ? buyerUserInfo.toObject() : null,
          auction: auction ? auction.toObject() : null,
          bids: bidDetails,
        };
      })
    );

    // Calculate total items count after applying the filters and search
    const totalItems = await Product.countDocuments(query); // Total count for pagination

    return res.status(200).json({
      items: productDetails,
      totalItems, // Total count for pagination
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.getSellerInfo = async(req, res) => {
  try{
    const sellerId = req.params.sellerId;
    const seller = await User.findById(sellerId);
    if(!seller) return res.status(404).json({ message: "Seller not found"});
    return res.status(200).json(seller);
  }catch(error){
    console.error(error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.getBuyerInfo = async(req, res) => {
  try{
    const buyerId = req.params.buyerId;
    const buyer= await User.findById(buyerId);
    if(!buyer) return res.status(404).json({ message: "Buyer not found"});
    return res.status(200).json(buyer);
  }catch(error){
    console.error(error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.getNormalSales = async (req, res) => {
  try {
    const rowsPerPage = parseInt(req.query.rows) || 5; // Number of items per page
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) - 1 : 0; // Page index, default to 0

    const filter = req.query.filter;
    const search = req.query.search;

    // Create a base query object to apply search and filter conditions
    const query = { is_auction: false };

    // Apply search if provided (searching by product name, category, or description)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Apply filtering based on the `filter` parameter
    if (filter) {
      switch (filter) {
        case "recent":
          query.createdAt = { $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) }; // Items from the past 7 days
          break;
        case "sold":
          query.status = "inactive";
          break;
        case "onSale":
          query.status = "active";
          break;
        default:
          break;
      }
    }

    // Fetch products based on query and pagination
    const products = await Product.find(query)
      .skip(page * rowsPerPage)
      .limit(rowsPerPage);

    // Map through each product and fetch its associated details
    const productDetails = await Promise.all(
      products.map(async (product) => {
        // Fetch sale data related to this product
        const sale = await Sale.findOne({ productId: product._id });

        // Fetch seller information
        const sellerUserInfo = await User.findById(product.sellerId).select("_id firstName lastName");

        // Fetch buyer information if a sale is found
        const buyerUserInfo = sale ? await User.findById(sale.userId).select("_id firstName lastName") : null;

        // Structure and return all details for this product
        return {
          product: product.toObject(),
          sale: sale ? sale.toObject() : null,
          seller: sellerUserInfo ? sellerUserInfo.toObject() : null,
          buyer: buyerUserInfo ? buyerUserInfo.toObject() : null,
        };
      })
    );

    // Count total items that match the query for pagination
    const totalItems = await Product.countDocuments(query);

    return res.status(200).json({
      items: productDetails,
      totalItems,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};
