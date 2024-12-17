const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction'
    },
    price:{
        type: Number,
         required: true
    },
    seller_Info: {
        firstName: {
            type:String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('Sales', salesSchema);