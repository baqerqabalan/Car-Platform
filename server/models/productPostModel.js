const mongoose = require('mongoose');

const productPostSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter product description"],
        trim: true,
        maxLength: [255, "Description cannot exceed 255 characters"]
    },
    price: {
        type: Number,
        required: [true, "Please enter product price"],
        min: [0.01, "Price must be at least 0.01"]
    },
    image: {
        type: String,
        required: [true, "Please enter product image"],
        trim: true
    },
    images: {
        type: [String], // Array of strings for multiple images
        message: "One or more image URLs are invalid",
        trim: true
    },

    is_auction: {
        type: Boolean,
        default: false
    },
    auction_start_date: {
        type: Date,
        validate: {
            validator: function (v) {
                // Ensure auction_start_date is before auction_end_date
                return !this.auction_end_date || v < this.auction_end_date;
            },
            message: "Auction start date must be before auction end date"
        }
    },
    auction_end_date: {
        type: Date,
        validate: {
            validator: function (v) {
                // Ensure auction_end_date is after auction_start_date
                return !v || v > this.auction_start_date;
            },
            message: "Auction end date must be after auction start date"
        }
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Please provide the seller's ID"]
    },
    category: {
        type: String,
        required: [true, "Please enter a valid category"]
    },
    status:{
        type:String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    address:{
        type:String,
        required: [true, "Please enter a valid address"]
    },
    confirmUserInfo: {
        type:Boolean,
        required:[true, "Check it please"]
    },
    agreeToTerms: {
        type:Boolean,
        required:[true, "Check it please"]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productPostSchema);
