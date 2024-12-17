const mongoose = require('mongoose');

const requestSubscriptionSchema = new mongoose.Schema({
    title: {
        type:String,
        required:true,
        trim:true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    marketName: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type:Number,
        required: true,
        min: 0
    },
    skills: {
        type:String,
        trim: true
    },
    image: {
        type: String,
    },
    additionalImages: {
        type: [String],
    },
    subscription: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref:'SubscriptionPackages'
    },
    requestedClientId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    recieptImg: {
        type:String,
        default:null
    },
    status: {
        type:String,
        enums: ['pending', 'approved', 'disapproved'],
        default:'pending'
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('RequestSubscriptions', requestSubscriptionSchema);