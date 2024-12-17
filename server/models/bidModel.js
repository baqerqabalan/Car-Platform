const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bidAmount: {
        type: Number,
        required: true
    },
    result: {
        type:String,
        enums:['win', 'lose'],
        required: true
    },
},{
    timestamps: true
});

module.exports = mongoose.model('Bid', bidSchema);
