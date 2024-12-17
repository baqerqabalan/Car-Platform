const Advertisement = require("../models/advertisementModel");
const Product = require("../models/productPostModel");

exports.getAd = async (req, res) => {
  try {
    const advertisements = await Advertisement.find({ status: "published" });

    // Fetch additional product details
    const productIds = advertisements.map((adv) => adv.productId); // Get product IDs
    const products = await Product.find({ _id: { $in: productIds } }).populate(
      "sellerId",
      "firstName lastName profileImg"
    );

    // Fetch total count of advertisements for the given filter

    // Respond with ads and pagination info
    return res.status(200).json({
      data: advertisements.map((ad) => {
        const product = products.find(
          (prod) => prod._id.toString() === ad.productId.toString()
        ); // Match the product
        return {
          ...ad.toObject(),
          product, // Add product details
        };
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
