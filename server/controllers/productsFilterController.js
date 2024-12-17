const Product = require("../models/productPostModel");
const User = require('../models/userModel');

const getPaginatedProducts = (req) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  return { limit, skip };
};

exports.getAllProducts = async (req, res) => {
  try {
    const { limit, skip } = getPaginatedProducts(req);
    const products = await Product.find({ status: "active" }).skip(skip).limit(limit);
    
    const sellerIds = products.map((product) => product.sellerId);

    const user = await User.find({_id: {$in: sellerIds}});

        // Create a map of users by ID for easier reference in the response
        const userMap = {};
        user.forEach(user => {
          userMap[user._id] = user;
        });
    
        // Add user details to products
        const productsWithSellers = products.map(product => ({
          ...product.toObject(),
          seller: userMap[product.sellerId] || null, // Attach seller data or null if not found
        }));
    
    // Count total products for pagination metadata
    const totalProducts = await Product.countDocuments({status:"active"});


    if(!user){
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      products: productsWithSellers,
      pagination: {
        currentPage: parseInt(req.query.page, 10) || 1,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        limit,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getNormalProducts = async (req, res) => {
  try {
    const { limit, skip } = getPaginatedProducts(req);
    const products = await Product.find({ is_auction: false, status: "active" }).skip(skip).limit(limit);

    const sellerIds = products.map((product) => product.sellerId);

    const user = await User.find({_id: {$in: sellerIds}});

        // Create a map of users by ID for easier reference in the response
        const userMap = {};
        user.forEach(user => {
          userMap[user._id] = user;
        });
    
        // Add user details to products
        const productsWithSellers = products.map(product => ({
          ...product.toObject(),
          seller: userMap[product.sellerId] || null, // Attach seller data or null if not found
        }));
    

    // Count total normal products for pagination metadata
    const totalProducts = await Product.countDocuments({ status: "active", is_auction: false });

    return res.status(200).json({
      products : productsWithSellers,
      pagination: {
        currentPage: parseInt(req.query.page, 10) || 1,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        limit,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getAuctionProducts = async (req, res) => {
  try {
    const { limit, skip } = getPaginatedProducts(req);
    const products = await Product.find({ is_auction: true, status: "active" }).skip(skip).limit(limit);

    const sellerIds = products.map((product) => product.sellerId);

    const user = await User.find({_id: {$in: sellerIds}});

        // Create a map of users by ID for easier reference in the response
        const userMap = {};
        user.forEach(user => {
          userMap[user._id] = user;
        });
    
        // Add user details to products
        const productsWithSellers = products.map(product => ({
          ...product.toObject(),
          seller: userMap[product.sellerId] || null, // Attach seller data or null if not found
        }));
    
    // Count total auction products for pagination metadata
    const totalProducts = await Product.countDocuments({ status: "active", is_auction: true });

    return res.status(200).json({
      products: productsWithSellers,
      pagination: {
        currentPage: parseInt(req.query.page, 10) || 1,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        limit,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getHightToLowPriceProducts = async(req, res) => {
    try{
        const filter = req.query.filter;
        let cond = {};  // Initialize as an empty object

        const {limit, skip} = getPaginatedProducts(req);

        // Build the condition based on filter
        if(filter){
            if(filter === "All"){
                cond = {status: "active"};
            }else if(filter === "Normal"){
                cond = { is_auction: false, status: "active"};
            }else if(filter === "Auction"){
                cond = { is_auction: true, status: "active" };
            }
        }

        // Fetch products with the applied conditions and sort by price descending
        const products = await Product.find(cond)
            .sort({price: -1})
            .skip(skip)
            .limit(limit);

        const sellerIds = products.map((product) => product.sellerId);

        // Fetch sellers based on the sellerIds from products
        const users = await User.find({_id: {$in: sellerIds}});

        // Create a map of users by ID for easier reference in the response
        const userMap = {};
        users.forEach(user => {
          userMap[user._id] = user;
        });

        // Add seller details to the product objects
        const productsWithSellers = products.map(product => ({
          ...product.toObject(),
          seller: userMap[product.sellerId] || null, // Attach seller data or null if not found
        }));

        // Count total products matching the condition
        const totalProducts = await Product.countDocuments(cond);

        return res.status(200).json({
          products: productsWithSellers,
          pagination: {
            currentPage: parseInt(req.query.page, 10) || 1,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            limit,
          },
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

exports.getLowToHighPriceProducts = async(req, res) => {
    try{
        const filter = req.query.filter;
        let cond = {};

        const {limit, skip} = getPaginatedProducts(req);

        if(filter){
            if(filter === "All"){
                cond = {status: "active"};
            }else if(filter === "Normal"){
                cond = { is_auction: false, status: "active"};
            }else if(filter === "Auction"){
                cond = { is_auction: true, status: "active" };
            }
        }

        const products = await Product.find(cond).sort({price: 1}).skip(skip).limit(limit);

        const sellerIds = products.map((product) => product.sellerId);

        const user = await User.find({_id: {$in: sellerIds}});
    
            // Create a map of users by ID for easier reference in the response
            const userMap = {};
            user.forEach(user => {
              userMap[user._id] = user;
            });
        
            // Add user details to products
            const productsWithSellers = products.map(product => ({
              ...product.toObject(),
              seller: userMap[product.sellerId] || null, // Attach seller data or null if not found
            }));
        
        // Count total auction products for pagination metadata
        const totalProducts = await Product.countDocuments(cond);
    
    
        return res.status(200).json({
          products: productsWithSellers,
          pagination: {
            currentPage: parseInt(req.query.page, 10) || 1,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            limit,
          },
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
};

exports.getNewestToOldestProducts = async(req, res) => {
    try{
        const filter = req.query.filter;
        let cond = {};

        const {limit, skip} = getPaginatedProducts(req);

        if(filter){
            if(filter === "All"){
                cond = {status: "active"};
            }else if(filter === "Normal"){
                cond = { is_auction: false, status: "active"};
            }else if(filter === "Auction"){
                cond = { is_auction: true, status: "active" };
            }
        }

        const products = await Product.find(cond).sort({createdAt: -1}).skip(skip).limit(limit);

        const sellerIds = products.map((product) => product.sellerId);

        const user = await User.find({_id: {$in: sellerIds}});
    
            // Create a map of users by ID for easier reference in the response
            const userMap = {};
            user.forEach(user => {
              userMap[user._id] = user;
            });
        
            // Add user details to products
            const productsWithSellers = products.map(product => ({
              ...product.toObject(),
              seller: userMap[product.sellerId] || null, // Attach seller data or null if not found
            }));
        
        // Count total auction products for pagination metadata
        const totalProducts = await Product.countDocuments( cond );
    
        return res.status(200).json({
          products: productsWithSellers,
          pagination: {
            currentPage: parseInt(req.query.page, 10) || 1,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            limit,
          },
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
};

exports.getOldestToNewestProducts = async(req, res) => {
    try{
        const filter = req.query.filter;
        let cond = {};

        const {limit, skip} = getPaginatedProducts(req);

        if(filter){
            if(filter === "All"){
                cond = {status: "active"};
            }else if(filter === "Normal"){
                cond = { is_auction: false, status: "active"};
            }else if(filter === "Auction"){
                cond = { is_auction: true, status: "active" };
            }
        }

        const products = await Product.find(cond).sort({ createdAt: 1 }).skip(skip).limit(limit);

        const sellerIds = products.map((product) => product.sellerId);

        const user = await User.find({_id: {$in: sellerIds}});
    
            // Create a map of users by ID for easier reference in the response
            const userMap = {};
            user.forEach(user => {
              userMap[user._id] = user;
            });
        
            // Add user details to products
            const productsWithSellers = products.map(product => ({
              ...product.toObject(),
              seller: userMap[product.sellerId] || null, // Attach seller data or null if not found
            }));
        
        // Count total auction products for pagination metadata
        const totalProducts = await Product.countDocuments(cond);
    
        return res.status(200).json({
          products: productsWithSellers,
          pagination: {
            currentPage: parseInt(req.query.page, 10) || 1,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            limit,
          },
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
};

exports.getSearchQuery = async (req, res) => {
    try {
      const { limit, skip } = getPaginatedProducts(req);
      const searchTerm = req.query.search || '';
      const filter = req.query.filter;
      const page = parseInt(req.query.page, 10) || 1;
  
      // Initialize cond as an object to store the query conditions
      let cond = { status: "active" };
  
      // Apply filters based on the query parameter
      if (filter === "Normal") {
        cond.is_auction = false;
      } else if (filter === "Auction") {
        cond.is_auction = true;
      }
  
      // Add search conditions (using $regex for partial matching)
      if (searchTerm) {
        cond.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          {category: { $regex: searchTerm, $options: 'i' } }
        ];
      }
  
      // Fetch products based on conditions, pagination, and search
      const products = await Product.find(cond)
        .skip(skip)
        .limit(limit);
  
      // Get the seller IDs from the products
      const sellerIds = products.map((product) => product.sellerId);
  
      // Fetch the corresponding users (sellers)
      const users = await User.find({ _id: { $in: sellerIds } });
  
      // Create a map of users by ID for easier reference in the response
      const userMap = {};
      users.forEach((user) => {
        userMap[user._id] = user;
      });
  
      // Add seller data to products
      const productsWithSellers = products.map((product) => ({
        ...product.toObject(),
        seller: userMap[product.sellerId] || null, // Attach seller data or null if not found
      }));
  
      // Count total matching products for pagination metadata
      const totalProducts = await Product.countDocuments(cond);
  
  
      // Send the response with products and pagination info
      return res.status(200).json({
        products: productsWithSellers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts,
          limit,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  };  

exports.filteredAndSortedProducts = async (req, res) => {
  try {
    const filter = req.query.filter;
    const sort = req.query.sort;
    const search = req.query.search;

    if(search){
        return await exports.getSearchQuery(req, res);
    }

    if(sort){
        if(sort === "highToLowPrice"){
            return await exports.getHightToLowPriceProducts(req, res);
        }else if(sort === "lowToHighPrice"){
            return await exports.getLowToHighPriceProducts(req, res);
        }else if(sort === "newestToOldest"){
            return await exports.getNewestToOldestProducts(req, res);
        }else if(sort === "oldestToNewest"){
            return await exports.getOldestToNewestProducts(req, res);
        }else{
            return res.status(400).json({message:"Invalid sort parameter"});
        }
    }

    // Filter logic
    if (filter === "All") {
      return await exports.getAllProducts(req, res);
    } else if (filter === "Normal") {
      return await exports.getNormalProducts(req, res);
    } else if (filter === "Auction") {
      return await exports.getAuctionProducts(req, res);
    } else {
      return res.status(400).json({ message: "Invalid filter option" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};