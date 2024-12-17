const Advertisement = require("../../../server/models/advertisementModel");
const Product = require("../../../server/models/productPostModel");
const path = require('path');
const fs = require('fs');
const cron  = require('node-cron')

exports.getAllAds = async (req, res) => {
  try {
    // Destructure and parse query parameters
    const { page = 1, limit = 10, tabValue } = req.query; // Default values added
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Determine filter condition based on tabValue
    let filterCondition = {};
    switch (tabValue) {
      case "0":
        filterCondition = { status: "published" };
        break;
      case "1":
        filterCondition = { status: "unpublished" };
        break;
      case "2":
        filterCondition = { status: "hasPublished" };
        break;
      default:
        return res.status(400).json({ message: "Invalid tab value" });
    }

    // Fetch advertisements with the applied filter and pagination
    const advertisements = await Advertisement.find(filterCondition)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Fetch additional product details
    const productIds = advertisements.map((adv) => adv.productId); // Get product IDs
    const products = await Product.find({ _id: { $in: productIds } }).populate(
      "sellerId",
      "firstName lastName profileImg"
    );

    // Fetch total count of advertisements for the given filter
    const totalCount = await Advertisement.countDocuments(filterCondition);

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
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.createAdvertisement = async (req, res) => {
  try {
    const { features, productId, startPublishDate, endPublishDate } = req.body;

    const uploadedFiles = req.files || {};

    // Define target directories for both admin and website
    const adminDir = path.join(__dirname, "../../client/public/models");
    const websiteDir = path.join(__dirname, "../../../client/public/models");
    const adminAudiosDir = path.join(adminDir, "audios");
    const websiteAudiosDir = path.join(websiteDir, "audios");

    // Helper to ensure directories exist
    const ensureDirectory = (dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    };

    // Ensure all directories exist
    ensureDirectory(adminDir);
    ensureDirectory(adminAudiosDir);
    ensureDirectory(websiteDir);
    ensureDirectory(websiteAudiosDir);

    // Helper function to copy a file to multiple destinations
    const copyFileToDirs = (file, targetDirs) => {
      if (!file) return null;
      const fileName = `${Date.now()}-${file.originalname}`;
      const relativePath = `/models${targetDirs[0].includes("audios") ? "/audios" : ""}/${fileName}`;

      for (const dir of targetDirs) {
        const targetPath = path.join(dir, fileName);
        try {
          fs.copyFileSync(file.path, targetPath);
        } catch (err) {
          throw new Error(`Failed to copy file ${file.originalname} to ${dir}: ${err.message}`);
        }
      }

      return relativePath; // Return the relative path for saving in the database
    };

    // Copy files to both admin and website directories
    const modelPath = copyFileToDirs(uploadedFiles["model"]?.[0], [adminDir, websiteDir]);
    const hornPath = copyFileToDirs(uploadedFiles["audios[horn]"]?.[0], [adminAudiosDir, websiteAudiosDir]);
    const enginePath = copyFileToDirs(uploadedFiles["audios[engine]"]?.[0], [adminAudiosDir, websiteAudiosDir]);
    const boostPath = copyFileToDirs(uploadedFiles["audios[boost]"]?.[0], [adminAudiosDir, websiteAudiosDir]);

    // Parse and validate features
    let parsedFeatures;
    try {
      parsedFeatures = JSON.parse(features);
    } catch (err) {
      throw new Error("Invalid features JSON provided.");
    }

    // Create a new Advertisement document
    const advertisement = new Advertisement({
      model: modelPath,
      audios: {
        horn: hornPath,
        engine: enginePath,
        boost: boostPath,
      },
      features: parsedFeatures,
      status: "unpublished",
      productId,
      startPublishDate,
      endPublishDate,
    });

    await advertisement.save();

    // Clean up temporary files after successful upload
    Object.values(req.files || {}).flat().forEach((file) => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    res.status(201).json({
      message: "Advertisement created successfully!",
      advertisement,
    });
  } catch (error) {
    console.error("Error creating advertisement:", error);

    // Clean up temporary files in case of an error
    Object.values(req.files || {}).flat().forEach((file) => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    res.status(500).json({
      message: "Failed to create advertisement",
      error: error.message,
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const names = await Product.find({status:"active"}).select("name sellerId").populate('sellerId', 'firstName lastName');

    return res.status(200).json(names);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.updateAdStatus = async (req, res) => {
  try {
    const { adId, status } = req.body;

    
    if (!adId || !status) {
      return res.status(400).json({ message: "adId and status are required" });
    }

    const ads = await Advertisement.findById(adId);
    if (!ads) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    if(status === "published") ads.status = status;
    if(status === "hasPublished") ads.status = status;
    
    await ads.save();

    return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating ad status:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Function to update advertisement statuses
const updateAdvertisementStatuses = async () => {
  const currentDate = new Date();

  try {
    // Update status to "published" if startPublishDate is reached
    await Advertisement.updateMany(
      { startPublishDate: { $lte: currentDate }, status: { $ne: "published" } },
      { $set: { status: "published" } }
    );

    // Update status to "haspublished" if endPublishDate is reached
    await Advertisement.updateMany(
      { endPublishDate: { $lte: currentDate }, status: { $ne: "hasPublished" } },
      { $set: { status: "hasPublished" } }
    );
  } catch (error) {
    console.error("Error updating advertisement statuses:", error);
  }
};

// Schedule the cron job to run every minute
cron.schedule("* * * * *", async () => {
  await updateAdvertisementStatuses();
});

exports.getTotalPublished = async(req, res) => {
  try{
    const totalPublished = await Advertisement.countDocuments({status: "published"});
    return res.status(200).json({totalPublished});
  }
  catch(error){
    console.error("Error getting total published ads:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}