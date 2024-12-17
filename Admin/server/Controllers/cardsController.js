const Product= require('../../../server/models/productPostModel');
const Question = require('../../../server/models/questionModel');
const User = require('../../../server/models/userModel');
const Sale = require('../../../server/models/salesModel');

exports.getTotalProducts = async(req, res) => {
    try{
        const total = await Product.countDocuments({status:"active"});

        return res.status(200).json({total});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
};

exports.getTotalSales = async(req, res) => {
    try{
        const total = await Sale.countDocuments();

        return res.status(200).json({total});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
};

exports.getTotalUsers = async(req, res) => {
    try{
        const total = await User.countDocuments();

        return res.status(200).json({total});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
};

exports.getTotalQuestions = async(req, res) => {
    try{
        const total = await Question.countDocuments({isResolved: true});

        return res.status(200).json({total});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
};