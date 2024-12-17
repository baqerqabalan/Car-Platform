const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");
const Votings = require('../models/votingsModel');

// Create a new question
exports.create = async (req, res) => {
  
  try {
    const { category, content } = req.body;

    const newQuestion = await Question.create({
      category,
      content,
      creatorId: req.user._id,
    });
   
    return res.status(201).json({
      message: "Question created successfully",
      data: { question: newQuestion },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Update a question
exports.update = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const { category, content } = req.body;

    // 1. Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // 2. Update question fields
    if (category) question.category = category;
    if (content) question.content = content;

    // 3. Save the updated question
    const updatedQuestion = await question.save();
    return res.status(200).json({
      message: "Question updated successfully",
      data: { question: updatedQuestion },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete a question
exports.delete = async (req, res) => {
  try {
    const questionId = req.params.questionId;

    // 1. Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // 2. Delete the answers of the question, then delete the question
    await Answer.deleteMany({ questionId: questionId });
    await question.deleteOne();

    // 3. Respond with success
    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getTopAnswersForFAQ = async (req, res) => {
  try {
    // Step 1: Fetch all questions with their answer counts
    const questionsWithAnswerCounts = await Question.aggregate([
      { $match: { isResolved: true } }, // Filter for resolved questions
      {
        $lookup: {
          from: 'answers', // Collection to join (answers)
          localField: '_id', // Field from the Question collection
          foreignField: 'questionId', // Field from the Answer collection
          as: 'answers', // Name for the joined field
        },
      },
      {
        $addFields: { answerCount: { $size: '$answers' } }, // Add a field with the count of answers
      },
      { $sort: { answerCount: -1 } }, // Sort by answer count (highest first)
      { $limit: 5 }, // Get the top 5 questions
    ]);

    // Step 2: For each question, find the top-voted answer and the number of votes
    const faqData = await Promise.all(
      questionsWithAnswerCounts.map(async (question) => {
        // Get the top-voted answer for the question
        const topAnswer = await Answer.findOne({ questionId: question._id })
          .sort({ votes: -1 }) // Sort by votes (highest first)
          .limit(1); // Get the top answer

        // Get the vote count for the top answer, if it exists
        const voteCounts = topAnswer
          ? await Votings.countDocuments({ answerId: topAnswer._id })
          : 0;

        return {
          question: question.content,
          topAnswer: topAnswer ? topAnswer.content : 'No answers yet',
          topAnswerVotes: voteCounts,
          answerCount: question.answerCount, // Total number of answers for the question
        };
      })
    );

    // Step 3: Return the FAQ data (for display on homepage)
    res.json(faqData);
  } catch (error) {
    console.error('Error fetching top answers for FAQ:', error);
    res.status(500).json({ message: 'Could not retrieve FAQ data'});
   }
  };

exports.getQuestionCounter = async (req, res) => {
  try {
    const counter = await Question.countDocuments({});
    return res.status(200).json({ count: counter });  // Send the count in the response
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.aggregate([
      {
        $lookup: {
          from: 'answers', // The collection for answers
          localField: '_id',
          foreignField: 'questionId',
          as: 'answers'
        }
      },
      {
        $addFields: {
          answerCount: { $size: '$answers' } // Adding a field for the count of answers per question
        }
      },
      {
        $unwind: {
          path: '$answers',
          preserveNullAndEmptyArrays: true // Ensure questions without answers are not excluded
        }
      },
      {
        $lookup: {
          from: 'votings', // The collection for votes
          localField: 'answers._id',
          foreignField: 'answerId',
          as: 'votes'
        }
      },
      {
        $group: {
          _id: '$_id',
          question: { $first: '$$ROOT' }, // Preserve the original question fields
          totalVotes: { $sum: { $size: '$votes' } } // Summing up votes for each question
        }
      },
      {
        $project: {
          'question.answers': 0, // Exclude the answers array, if you don't want to include them in the result
          totalVotes: 1,
          'question.answerCount': 1
        }
      }
    ]);

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: "Nothing Found" });
    }

    return res.status(200).json({ data: questions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};