const mongoose = require('mongoose');

const earnedBadgeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
        required: true
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('EarnedBadge', earnedBadgeSchema);
