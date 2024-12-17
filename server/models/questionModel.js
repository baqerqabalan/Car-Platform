const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, "Please enter the question content"],
        minlength: [8, "The content must be at least 8 characters long"],
        maxlength: [255, "The content must be at most 255 characters long"],
        trim: true,
    },
    category: {
        type: String,
        required: [true, "Please select a category"],
        enum: ['General','Engine & Transmission', 'Electrical System', 'Brakes & Suspension', 'Cooling & Heating', 'Fuel & Exhaust', 'Tires & Wheels'],
        default:'General'
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isResolved: {
        type: Boolean,
        default: false, 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Question", questionSchema);
