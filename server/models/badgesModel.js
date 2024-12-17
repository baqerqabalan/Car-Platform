const mongoose = require('mongoose');

const badgesSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter the badge name"]
    },
    description: {
        type: String,
        required: [true, "Please enter the badge description"]
    },
    score: {
        type: Number,
        required: [true, "Please enter the minimum score required for the badge"],
        min: [0, "score must be greater than or equal to 0"]
    },
},
{
    timestamps: true
});

module.exports = mongoose.model("Badge", badgesSchema);