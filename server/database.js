const mongoose = require('mongoose');
require('dotenv').config();

exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log("MongoDB is connected");
    } catch (error) {
        console.log("Database connection failed: ", error.message);
        process.exit(1);
    }
};
