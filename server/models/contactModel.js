const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Please enter your full name"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"]
        },
    message: {
        type: String,
        required: [true, "Please enter the message"]
    },
    reply: {
        type: String,
        default: ""
    },
    creatorId: {
        type: mongoose.Types.ObjectId,
        required: [true, "Please enter the creatorId"],
        ref: 'User'
    },
    status:{
        type:String,
        enum: ['pending', 'resolved'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);