const express = require('express');
const Voting = require('../models/votingsModel');
const Answer = require('../models/answerModel');
const { updateUserReputationScore } = require('../controllers/authController');

exports.addVote = async (req, res) => {
    try {
        const { voteType } = req.body; // Expect 'upvote' or 'downvote'
        const voterUserId = req.user._id;
        const answerId = req.params.answerId;

        // Check if the user has already voted on this answer
        const existingVote = await Voting.findOne({ answerId, voterUserId });

        if (existingVote) {
            if (existingVote.voteType === voteType) {
                // If the vote is the same, remove it (toggle)
                await existingVote.deleteOne();

                // Decrease reputation score (assuming reputation decreases by 5 when removing a vote)
                const reputationChange = voteType === 'upvote' ? -5 : -3; // Different values for upvote/downvote
                //await updateUserReputationScore(voterUserId, reputationChange);
                
                // Recalculate votes for the answer
                await updateAnswerVotes(answerId);

                return res.status(201).json({ message: "Vote removed successfully" });
            } else {
                // Update the existing vote if different (upvote -> downvote, or vice versa)
                const prevVoteType = existingVote.voteType;
                existingVote.voteType = voteType;
                await existingVote.save();

                // Adjust the reputation score accordingly
                const reputationChange = prevVoteType === 'upvote' ? -5 : -3; // Remove the previous vote
                const newReputationChange = voteType === 'upvote' ? 5 : 3; // Add the new vote
                //await updateUserReputationScore(voterUserId, reputationChange + newReputationChange);

                // Recalculate votes for the answer
                await updateAnswerVotes(answerId);

                return res.status(201).json({ message: "Vote updated successfully" });
            }
        }

        // If no previous vote exists, create a new one
        const newVote = await Voting.create({ answerId, voterUserId, voteType });

        // Update reputation score (increase by 5 for upvote, 3 for downvote)
        const reputationChange = voteType === 'upvote' ? 5 : 3;
        //await updateUserReputationScore(voterUserId, reputationChange);

        // Recalculate votes for the answer
        await updateAnswerVotes(answerId);

        return res.status(201).json({ message: "Vote added successfully", data: { voting: newVote } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const updateAnswerVotes = async (answerId) => {
    const upvotes = await Voting.countDocuments({ answerId, voteType: 'upvote' });
    const downvotes = await Voting.countDocuments({ answerId, voteType: 'downvote' });

    await Answer.findByIdAndUpdate(answerId, { upVotes: upvotes, downVotes: downvotes });
};
