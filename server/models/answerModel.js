const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, "Please enter the question content"],
        minlength: [8, "The content must be at least 8 characters long"],
        trim: true, // Trims any whitespace around the content
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    upVotes: {
        type: Number,
        default: 0,  // Start with 0 votes
    },
    downVotes: {
        type: Number,
        default: 0
    },
    postedAs: {
        type: String,
        enum: ["name", "guest"]
    }
},
{
    timestamps: true
});

answerSchema.pre('find', function(next) {
    this.populate('creatorId').populate('questionId');
    next();
});


module.exports = mongoose.model("Answer", answerSchema);