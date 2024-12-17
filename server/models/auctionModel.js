const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    highestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    highestBid: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default:" active"
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('Auction', auctionSchema);