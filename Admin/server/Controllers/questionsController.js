const Question = require('../../../server/models/questionModel');
const Answer = require('../../../server/models/answerModel');
const Voting = require('../../../server/models/votingsModel');

exports.getAllQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
    const pageSize = parseInt(req.query.pageSize, 10) || 10; // Default pageSize to 10 if not provided

    const skip = (page - 1) * pageSize;

    // Fetch questions with pagination and populate the creator and answers
    const questions = await Question.find()
      .skip(skip)
      .limit(pageSize)
      .populate('creatorId', 'firstName lastName') // Populate creator details
      .lean(); // Convert documents to plain objects for manipulation

    const totalQuestions = await Question.countDocuments();

    // Fetch answer counts for the questions in a single aggregation query
    const answerCounts = await Answer.aggregate([
      { $match: { questionId: { $in: questions.map((q) => q._id) } } },
      { $group: { _id: "$questionId", count: { $sum: 1 } } },
    ]);

    // Create a map for answer counts
    const answerCountsMap = {};
    answerCounts.forEach(({ _id, count }) => {
      answerCountsMap[_id] = count;
    });

    // Combine data with answer counts
    const data = questions.map((question) => ({
      ...question,
      answerCount: answerCountsMap[question._id] || 0, // Default to 0 if no answers
    }));

    return res.status(200).json({
      questions: data,
      total: totalQuestions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getAllAnswers = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = 10; // Number of answers per page
    const skip = (page - 1) * limit; // Calculate how many documents to skip

    // Fetch question content
    const question = await Question.findById(questionId).select('content');

    // Fetch answers with pagination and populate creator information
    const answers = await Answer.find({ questionId })
      .skip(skip)
      .limit(limit)
      .populate('creatorId', 'firstName lastName profileImg');

    // Count total answers for the question
    const answerCounts = await Answer.countDocuments({ questionId });

    // Map each answer to include `voteCounts` as the sum of `upVotes` and `downVotes`
    const answersWithVotes = answers.map(answer => {
      const voteCounts = (answer.upVotes || 0) + (answer.downVotes || 0); // Handle missing fields with default to 0
      return {
        ...answer.toObject(),
        voteCounts,
      };
    });

    // Return the paginated results along with total count and total pages
    return res.status(200).json({
      answers: answersWithVotes,
      question,
      answerCounts,
      totalPages: Math.ceil(answerCounts / limit), // Calculate total pages
    });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.getAllVoters = async (req, res) => {
  try {
    const answerId = req.params.answerId;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 20; // Default to 20 items per page

    const answer = await Answer.findById(answerId).select('content');
    const skip = (page - 1) * limit;

    const [upVotings, downVotings] = await Promise.all([
      Voting.find({ answerId, voteType: "upvote" })
        .populate("voterUserId", "firstName lastName profileImg")
        .skip(skip)
        .limit(limit),
      Voting.find({ answerId, voteType: "downvote" })
        .populate("voterUserId", "firstName lastName profileImg")
        .skip(skip)
        .limit(limit),
    ]);

    const totalUpvotes = await Voting.countDocuments({
      answerId,
      voteType: "upvote",
    });
    const totalDownvotes = await Voting.countDocuments({
      answerId,
      voteType: "downvote",
    });

    return res.status(200).json({
      upvoters: upVotings,
      downvoters: downVotings,
      answer: answer.content,
      totalUpvotes,
      totalDownvotes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};