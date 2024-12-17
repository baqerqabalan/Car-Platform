const express = require("express");
const Answer = require("../models/answerModel");
const Question = require("../models/questionModel");
const mongoose = require("mongoose");
const Voting = require('../models/votingsModel');
const { updateUserReputationScore } = require("../controllers/earnedBadgesController");

exports.create = async (req, res) => {
  try {
    const content = req.body.content;
    const postedAs = req.body.postedAs;
    const creatorId = req.user._id;
    const questionId = req.params.questionId;

    const newAnswer = await Answer.create({
      content,
      postedAs,
      creatorId,
      questionId,
    });

    // Assuming a fixed reputation change value for this example
    const reputationChange = 2;

    // Update the user's reputation score
    await updateUserReputationScore(creatorId, reputationChange);

    const answerCount = await Answer.countDocuments({ questionId });
    if (answerCount === 1) {
      await Question.findByIdAndUpdate(
        questionId,
        { isResolved: true },
        { new: true }
      );
    }

    return res.status(201).json({
      message: "Answer created Successfully",
      data: { answer: newAnswer },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.update = async (req, res) => {
  try {
    const answerId = req.params.answerId;
    const content = req.body.content;

    // 1. Find the answer
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // 2. Update answer fields
    if (content) answer.content = content;

    // 3. Save the updated answer
    const updatedAnswer = await answer.save();
    return res.status(200).json({
      message: "Answer updated successfully",
      data: { answer: updatedAnswer },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete a answer
exports.delete = async (req, res) => {
  try {
    const answerId = req.params.answerId;

    // 1. Find the answer
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // 2. Delete the answer of the question
    await answer.deleteOne();

    // Assuming a fixed reputation change value for this example
    const reputationChange = -2;

    // Update the user's reputation score
    await updateUserReputationScore(creatorId, reputationChange);

    // 3. Respond with success
    return res.status(200).json({ message: "Answer deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid Question ID" });
    }

    const question = await Question.findOne({ _id: questionId });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Correct counting of answers
    const answerCounts = await Answer.countDocuments({
      questionId: questionId,
    });

    res.status(200).json({
      data: {
        questionData: question,
        answerCounts: answerCounts,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getQuestionsInfo = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const userId = req.user ? req.user._id : null; // Check if user is logged in
    const page = parseInt(req.query.page) || 1; // Cast page to a number or default to 1
    const limit = parseInt(req.query.limit) || 5; // Cast limit to a number or default to 10

    const question = await Question.findOne({ _id: questionId });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Fetch paginated answers for the question and populate the user details (first name, last name, profileImg)
    const answers = await Answer.find({ questionId: questionId })
      .skip((page - 1) * limit) // Skip previous pages
      .limit(limit) // Limit the number of answers returned
      .populate('creatorId', 'firstName lastName profileImg'); // Populate user details

    // Fetch total count of answers
    const totalAnswers = await Answer.countDocuments({ questionId: questionId });

    // Loop through answers and conditionally check for user's vote if authenticated
    const answerDataWithVotes = await Promise.all(
      answers.map(async (answer) => {
        let userVote = null; // Default is no vote information

        // If user is authenticated, check for existing vote
        if (userId) {
          const existingVote = await Voting.findOne({
            answerId: answer._id,
            voterUserId: userId
          });
          userVote = existingVote ? existingVote.voteType : null; // Set voteType if it exists
        }

        // Return answer with or without vote info, including user details
        return {
          ...answer.toObject(),
          userVote: userVote, // Will be null if user is not authenticated or has not voted
        };
      })
    );

    res.status(200).json({
      answerData: answerDataWithVotes,
      totalPages: Math.ceil(totalAnswers / limit), // Calculate total pages
      currentPage: Number(page), // Send current page
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};