const EarnedBadge = require('../models/earnedBadges');
const User = require('../models/userModel');
const Badge = require('../models/badgesModel');

exports.assignBadge = async (badgeId, userId) => {
    try {
        // Check if the user already has this badge
        const existingBadge = await EarnedBadge.findOne({ userId, badgeId });
        if (existingBadge) {
            return { message: "Badge already awarded" };
        }

        // Create new earned badge entry
        const earnedBadge = await EarnedBadge.create({ userId, badgeId });

        return { message: "Badge awarded successfully", data: { earnedBadge } };
    } catch (error) {
        console.error("Error awarding badge:", error);
        throw new Error("Something went wrong");
    }
};

exports.updateUserReputationScore = async (userId, scoreChange) => {
    try {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        // Update the reputation score
        user.reputationScore += scoreChange;
        await user.save();

        // Get all badges with their scores
        const badges = await Badge.find(); // Assuming Badge has `score` and `_id`
        
        // Check if the user qualifies for any badge
        for (const badge of badges) {
            if (user.reputationScore >= badge.score) {
                // Assign the badge if the user meets the required score
                await this.assignBadge(badge._id, userId);
            }
        }

    } catch (error) {
        console.error('Error updating reputation score:', error);
    }
};