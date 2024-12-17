const mongoose = require('mongoose');

const subscriptionPackagesSchema = new mongoose.Schema({
    title: {
        type:String,
        required:["true", "Please enter a title"],
        trim:true
    },
    description: {
        type:[String],
        required: ["true", "Please enter a description"],
        trim: true
    },
    price: {
        type:Number,
        required: ["true", "Please enter a price"]
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('SubscriptionPackages', subscriptionPackagesSchema);