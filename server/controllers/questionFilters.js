const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");
const moment = require("moment");
const Votings = require("../models/votingsModel");

const getPaginatedQuestions = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  return { limit, skip };
};

const aggregateQuestionStats = async (questionIds) => {
  // Aggregate answer counts for each question
  const answerCountsRaw = await Answer.aggregate([
    { $match: { questionId: { $in: questionIds } } },
    { $group: { _id: "$questionId", count: { $sum: 1 } } },
  ]);

  // Map answer counts to the question ID
  const answerCounts = answerCountsRaw.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Fetch the answers related to the questions
  const answers = await Answer.find({ questionId: { $in: questionIds } });

  return { answerCounts, answers };
};

exports.getNewestQuestions = async (req, res) => {
  try {
    const { limit, skip } = getPaginatedQuestions(req);
    const fiveDaysAgo = moment().subtract(5, "days").toDate();

    // Fetch the newest questions using MongoDB aggregation
    const newestQuestions = await Question.aggregate([
      {
        $match: {
          createdAt: { $gte: fiveDaysAgo }, // Filter questions from the last 5 days
        },
      },
      {
        $lookup: {
          from: "answers", // Collection for answers
          localField: "_id",
          foreignField: "questionId",
          as: "answers",
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by newest
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    // Extract all answer IDs from the newest questions
    const answerIds = newestQuestions.flatMap((q) =>
      q.answers.map((answer) => answer._id)
    );

    // Only aggregate stats for newest questions
    const { answerCounts } = await aggregateQuestionStats(
      newestQuestions.map((q) => q._id)
    );

    // Fetch all voting related to the answers
    const votings = await Votings.find({ answerId: { $in: answerIds } });

    // Count the votes per question by mapping answers back to their questionId
    const voteCounts = votings.reduce((acc, voting) => {
      const answer = newestQuestions
        .flatMap((q) => q.answers)
        .find((ans) => ans._id.equals(voting.answerId));
      if (answer) {
        acc[answer.questionId] = (acc[answer.questionId] || 0) + 1;
      }
      return acc;
    }, {});

    // Enrich the questions with both answer counts and vote counts
    const enrichedQuestions = newestQuestions.map((question) => ({
      ...question,
      answerCounts: answerCounts[question._id] || 0, // Answer count per question
      voteCounts: voteCounts[question._id] || 0, // Vote count per question
    }));

    return res.status(200).json({ data: enrichedQuestions });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getActiveQuestions = async (req, res) => {
  try {
    const { limit, skip } = getPaginatedQuestions(req);

    // Fetch active questions that have answers using MongoDB aggregation
    const activeQuestions = await Question.aggregate([
      {
        $lookup: {
          from: "answers", // Collection for answers
          localField: "_id",
          foreignField: "questionId",
          as: "answers",
        },
      },
      {
        $match: {
          "answers.0": { $exists: true }, // Ensures the question has at least one answer
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    // Extract all answer IDs from the active questions
    const answerIds = activeQuestions.flatMap((q) =>
      q.answers.map((answer) => answer._id)
    );

    // Only aggregate stats for active (answered) questions
    const { answerCounts } = await aggregateQuestionStats(
      activeQuestions.map((q) => q._id)
    );

    // Fetch all voting related to the answers
    const votings = await Votings.find({ answerId: { $in: answerIds } });

    // Count the votes per question by mapping answers back to their questionId
    const voteCounts = votings.reduce((acc, voting) => {
      const answer = activeQuestions
        .flatMap((q) => q.answers)
        .find((ans) => ans._id.equals(voting.answerId));
      if (answer) {
        acc[answer.questionId] = (acc[answer.questionId] || 0) + 1;
      }
      return acc;
    }, {});

    // Append vote counts to each question
    const activistQuestions = activeQuestions.map((question) => ({
      ...question,
      answerCounts: answerCounts[question._id] || 0,
      voteCounts: voteCounts[question._id] || 0, // Add vote counts for each question
    }));

    return res.status(200).json({ data: activistQuestions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getUnansweredQuestions = async (req, res) => {
  try {
    const { limit, skip } = getPaginatedQuestions(req);

    // Fetch unanswered questions using MongoDB aggregation
    const unansweredQuestions = await Question.aggregate([
      {
        $lookup: {
          from: "answers", // Collection name for answers
          localField: "_id",
          foreignField: "questionId",
          as: "answers",
        },
      },
      {
        $match: {
          answers: { $size: 0 }, // Only return questions with no answers
        },
      },
      {
        $skip: skip, // Pagination: skip
      },
      {
        $limit: limit, // Pagination: limit
      },
      {
        $lookup: {
          from: "Votings", // Collection name for votings
          localField: "_id",
          foreignField: "questionId",
          as: "votings", // This will store votings data for the question
        },
      },
      {
        $project: {
          _id: 1, // Keep the question ID
          content: 1, // Keep other fields you want like title, description, etc.
          createdAt: 1,
          votings: 1, // Include votings field entirely
          // You may include other question fields here if necessary
        },
      },
    ]);

    // Only aggregate stats for active (answered) questions
    const { answerCounts } = await aggregateQuestionStats(
      unansweredQuestions.map((q) => q._id)
    );

    // Create a map to store vote count for each question
    const voteCounts = unansweredQuestions.reduce((acc, question) => {
      const totalVotes = question.votings.length; // Count the number of votes
      acc[question._id] = totalVotes; // Store the vote count per question
      return acc;
    }, {});

    // Append vote counts to each question
    const unAnsweredQuestionsWithVotes = unansweredQuestions.map(
      (question) => ({
        ...question,
        answerCounts: answerCounts[question._id] || 0,
        voteCounts: voteCounts[question._id] || 0, // Add vote count (default 0 if no votes)
      })
    );

    return res.status(200).json({ data: unAnsweredQuestionsWithVotes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.mostToLowestVoted = async (req, res) => {
  try {
    // Extract pagination values (limit and skip)
    const { limit, skip } = getPaginatedQuestions(req); // Ensure this function fetches limit/skip from request

    const filter = req.query.filter;

    let cond = null;

    if (filter === "Newest") {
      cond = { createdAt: { $gte: moment().subtract(5, "days").toDate() } };
    } else if (filter === "Active") {
      cond = { "answers.0": { $exists: true } };
    } else if (filter === "UnAnswered") {
      cond = { "answers": { $size: 0 } };
    }

    // Aggregation pipeline to fetch and calculate votes and answer counts
    const questions = await Question.aggregate([
      {
        $lookup: {
          from: "answers", // Join with the "answers" collection
          localField: "_id",
          foreignField: "questionId",
          as: "answers", // Results of the join will be in "answers" field
        },
      },
      { $match: cond },
      {
        $lookup: {
          from: "votings", // Join with the "votings" collection
          localField: "answers._id", // Match voting with the answer IDs
          foreignField: "answerId",
          as: "votings", // Results of the join will be in "votings" field
        },
      },
      {
        $addFields: {
          voteCounts: { $size: "$votings" }, // Count number of votes for each question
          answerCounts: { $size: "$answers" }, // Count number of answers for each question
        },
      },
      {
        $sort: { voteCounts: -1 }, // Sort questions by totalVotes in descending order (most voted first)
      },
      {
        $skip: skip, // Pagination: skip this many documents
      },
      {
        $limit: limit, // Pagination: limit the number of documents returned
      },
      {
        $project: {
          _id: 1, // Return only the necessary fields
          content: 1, // Include question content (e.g., title, description)
          createdAt: 1,
          voteCounts: 1, // Include calculated total votes
          answerCounts: 1, // Include calculated answer counts
        },
      },
    ]);

    // Return the paginated and sorted questions with vote and answer counts
    return res.status(200).json({
      data: questions, // The list of questions, sorted by votes, with pagination
      total: await Question.countDocuments(), // Total number of questions for pagination purposes
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.lowestToMostVoted = async (req, res) => {
  try {
    // Extract pagination values (limit and skip)
    const { limit, skip } = getPaginatedQuestions(req); // Ensure this function fetches limit/skip from request

    const filter = req.query.filter;

    let cond = null;

    if (filter === "Newest") {
      cond = { createdAt: { $gte: moment().subtract(5, "days").toDate() } };
    } else if (filter === "Active") {
      cond = { "answers.0": { $exists: true } };
    } else if (filter === "UnAnswered") {
      cond = { "answers": { $size: 0 } };
    }

    // Aggregation pipeline to fetch and calculate votes and answer counts
    const questions = await Question.aggregate([
      {
        $lookup: {
          from: "answers", // Join with the "answers" collection
          localField: "_id",
          foreignField: "questionId",
          as: "answers", // Results of the join will be in "answers" field
        },
      },
      { $match: cond },
      {
        $lookup: {
          from: "votings", // Join with the "votings" collection
          localField: "answers._id", // Match voting with the answer IDs
          foreignField: "answerId",
          as: "votings", // Results of the join will be in "votings" field
        },
      },
      {
        $addFields: {
          voteCounts: { $size: "$votings" }, // Count number of votes for each question
          answerCounts: { $size: "$answers" }, // Count number of answers for each question
        },
      },
      {
        $sort: { voteCounts: 1 }, // Sort questions by totalVotes in descending order (most voted first)
      },
      {
        $skip: skip, // Pagination: skip this many documents
      },
      {
        $limit: limit, // Pagination: limit the number of documents returned
      },
      {
        $project: {
          _id: 1, // Return only the necessary fields
          content: 1, // Include question content (e.g., title, description)
          createdAt: 1,
          voteCounts: 1, // Include calculated total votes
          answerCounts: 1, // Include calculated answer counts
        },
      },
    ]);

    // Return the paginated and sorted questions with vote and answer counts
    return res.status(200).json({
      data: questions, // The list of questions, sorted by votes, with pagination
      total: await Question.countDocuments(), // Total number of questions for pagination purposes
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.newestToOldest = async (req, res) => {
  try {
    // Extract pagination values (limit and skip)
    const { limit, skip } = getPaginatedQuestions(req); // Ensure this function fetches limit/skip from request

    const filter = req.query.filter;

    let cond = null;

    if (filter === "Newest") {
      cond = { createdAt: { $gte: moment().subtract(5, "days").toDate() } };
    } else if (filter === "Active") {
      cond = { "answers.0": { $exists: true } };
    } else if (filter === "UnAnswered") {
      cond = { "answers": { $size: 0 } };
    }

    // Aggregation pipeline to fetch and calculate votes and answer counts
    const questions = await Question.aggregate([
      {
        $lookup: {
          from: "answers", // Join with the "answers" collection
          localField: "_id",
          foreignField: "questionId",
          as: "answers", // Results of the join will be in "answers" field
        },
      },
      { $match: cond },
      {
        $lookup: {
          from: "votings", // Join with the "votings" collection
          localField: "answers._id", // Match voting with the answer IDs
          foreignField: "answerId",
          as: "votings", // Results of the join will be in "votings" field
        },
      },
      {
        $addFields: {
          voteCounts: { $size: "$votings" }, // Count number of votes for each question
          answerCounts: { $size: "$answers" }, // Count number of answers for each question
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort questions by totalVotes in descending order (most voted first)
      },
      {
        $skip: skip, // Pagination: skip this many documents
      },
      {
        $limit: limit, // Pagination: limit the number of documents returned
      },
      {
        $project: {
          _id: 1, // Return only the necessary fields
          content: 1, // Include question content (e.g., title, description)
          createdAt: 1,
          voteCounts: 1, // Include calculated total votes
          answerCounts: 1, // Include calculated answer counts
        },
      },
    ]);

    // Return the paginated and sorted questions with vote and answer counts
    return res.status(200).json({
      data: questions, // The list of questions, sorted by votes, with pagination
      total: await Question.countDocuments(), // Total number of questions for pagination purposes
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.oldestToNewest = async (req, res) => {
  try {
    // Extract pagination values (limit and skip)
    const { limit, skip } = getPaginatedQuestions(req); // Ensure this function fetches limit/skip from request

    const filter = req.query.filter;

    let cond = null;

    if (filter === "Newest") {
      cond = { createdAt: { $gte: moment().subtract(5, "days").toDate() } };
    } else if (filter === "Active") {
      cond = { "answers.0": { $exists: true } };
    } else if (filter === "UnAnswered") {
      cond = { "answers": { $size: 0 } };
    }

    // Aggregation pipeline to fetch and calculate votes and answer counts
    const questions = await Question.aggregate([
      {
        $lookup: {
          from: "answers", // Join with the "answers" collection
          localField: "_id",
          foreignField: "questionId",
          as: "answers", // Results of the join will be in "answers" field
        },
      },
      { $match: cond },
      {
        $lookup: {
          from: "votings", // Join with the "votings" collection
          localField: "answers._id", // Match voting with the answer IDs
          foreignField: "answerId",
          as: "votings", // Results of the join will be in "votings" field
        },
      },
      {
        $addFields: {
          voteCounts: { $size: "$votings" }, // Count number of votes for each question
          answerCounts: { $size: "$answers" }, // Count number of answers for each question
        },
      },
      {
        $sort: { createdAt: 1 }, // Sort questions by totalVotes in descending order (most voted first)
      },
      {
        $skip: skip, // Pagination: skip this many documents
      },
      {
        $limit: limit, // Pagination: limit the number of documents returned
      },
      {
        $project: {
          _id: 1, // Return only the necessary fields
          content: 1, // Include question content (e.g., title, description)
          createdAt: 1,
          voteCounts: 1, // Include calculated total votes
          answerCounts: 1, // Include calculated answer counts
        },
      },
    ]);

    // Return the paginated and sorted questions with vote and answer counts
    return res.status(200).json({
      data: questions, // The list of questions, sorted by votes, with pagination
      total: await Question.countDocuments(), // Total number of questions for pagination purposes
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.unansweredOnly = async (req, res) => {
  try {
    const { limit, skip } = getPaginatedQuestions(req);

    const filter = req.query.filter;

    let cond = null;

    if (filter === "Newest") {
      cond = { createdAt: { $gte: moment().subtract(5, "days").toDate() } };
    } else if (filter === "Active") {
      cond = { "answers.0": { $exists: true } };
    } else if (filter === "UnAnswered") {
      cond = { "answers": { $size: 0 } };
    }

    // Fetch unanswered questions using MongoDB aggregation
    const unansweredQuestions = await Question.aggregate([
      {
        $lookup: {
          from: "answers", // Collection name for answers
          localField: "_id",
          foreignField: "questionId",
          as: "answers",
        },
      },
      {
        $match: {
          answers: { $size: 0 }, // Only return questions with no answers
          cond,
        },
      },
      {
        $skip: skip, // Pagination: skip
      },
      {
        $limit: limit, // Pagination: limit
      },
      {
        $lookup: {
          from: "Votings", // Collection name for votings
          localField: "_id",
          foreignField: "questionId",
          as: "votings", // This will store votings data for the question
        },
      },
      {
        $project: {
          _id: 1, // Keep the question ID
          content: 1, // Keep other fields you want like title, description, etc.
          createdAt: 1,
          votings: 1, // Include votings field entirely
          // You may include other question fields here if necessary
        },
      },
    ]);

    // Only aggregate stats for active (answered) questions
    const { answerCounts } = await aggregateQuestionStats(
      unansweredQuestions.map((q) => q._id)
    );

    // Create a map to store vote count for each question
    const voteCounts = unansweredQuestions.reduce((acc, question) => {
      const totalVotes = question.votings.length; // Count the number of votes
      acc[question._id] = totalVotes; // Store the vote count per question
      return acc;
    }, {});

    // Append vote counts to each question
    const unAnsweredQuestionsWithVotes = unansweredQuestions.map(
      (question) => ({
        ...question,
        answerCounts: answerCounts[question._id] || 0,
        voteCounts: voteCounts[question._id] || 0, // Add vote count (default 0 if no votes)
      })
    );

    return res.status(200).json({ data: unAnsweredQuestionsWithVotes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.unVotedQuestions = async (req, res) => {
  try {
    // Extract pagination values (limit and skip)
    const { limit, skip } = getPaginatedQuestions(req);

    // Set filter conditions based on the query parameter
    let filterConditions = [];

    if (req.query.filter === "Newest") {
      filterConditions.push({ createdAt: { $gte: moment().subtract(5, "days").toDate() } });
    } else if (req.query.filter === "Active") {
      filterConditions.push({ "answers.0": { $exists: true } });
    } else if (req.query.filter === "UnAnswered") {
      filterConditions.push({ answers: { $size: 0 } });
    }

    // Ensure that questions with zero votes are selected
    filterConditions.push({ voteCounts: 0 });

    // Aggregation pipeline to fetch and calculate votes and answer counts
    const questions = await Question.aggregate([
      {
        $lookup: {
          from: "answers",
          localField: "_id",
          foreignField: "questionId",
          as: "answers",
        },
      },
      {
        $lookup: {
          from: "votings",
          localField: "answers._id",
          foreignField: "answerId",
          as: "votings",
        },
      },
      {
        $addFields: {
          voteCounts: { $size: "$votings" },
          answerCounts: { $size: "$answers" },
        },
      },
      {
        $match: { $and: filterConditions },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          voteCounts: 1,
          answerCounts: 1,
        },
      },
    ]);

    // Get the total number of documents that match the conditions
    const total = await Question.countDocuments({ $and: filterConditions });

    // Return the paginated and sorted questions with vote and answer counts
    return res.status(200).json({
      data: questions,
      total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.searchQuestions = async (req, res) => {
  try {
    const { limit, skip } = getPaginatedQuestions(req);
    const filter = req.query.filter;
    const searchTerm = req.query.search || "";

    // Default condition
    let matchConditions = {};

    // Add search conditions directly in the match stage (using $regex for partial matching)
    if (searchTerm) {
      matchConditions.$or = [
        { content: { $regex: searchTerm, $options: "i" } }, // Search in content
        { category: { $regex: searchTerm, $options: "i" } }, // Search in category
      ];
    }

    // Apply filters based on the query parameter
    if (filter === "Newest") {
      matchConditions.createdAt = { $gte: moment().subtract(5, "days").toDate() };
    } else if (filter === "Active") {
      matchConditions["answers.0"] = { $exists: true };
    } else if (filter === "UnAnswered") {
      matchConditions.answers = { $size: 0 };
    }

    // Aggregation pipeline to fetch and calculate votes and answer counts
    const questions = await Question.aggregate([
      {
        $lookup: {
          from: "answers",
          localField: "_id",
          foreignField: "questionId",
          as: "answers",
        },
      },
      { $match: matchConditions }, // Apply the combined match conditions
      {
        $lookup: {
          from: "votings",
          localField: "answers._id",
          foreignField: "answerId",
          as: "votings",
        },
      },
      {
        $addFields: {
          voteCounts: { $size: "$votings" },
          answerCounts: { $size: "$answers" },
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          voteCounts: 1,
          answerCounts: 1,
        },
      },
    ]);

    // Get the total number of documents that match the conditions
    const total = await Question.countDocuments(matchConditions);

    // Return the data and total count
    return res.status(200).json({
      data: questions,
      total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.filteredAndSortedQuestions = async (req, res) => {
  try {
    const filter = req.query.filter; // e.g., "Newest"
    const sort = req.query.sort; // e.g., "mostToLowestVoted"
    const unansweredOnly = req.query.unansweredOnly === "true"; // Convert to boolean
    const unvotedOnly = req.query.unvotedOnly === "true"; // Convert to boolean
    const search = req.query.search;

    // Handle unansweredOnly filter
    if (unansweredOnly) {
      return await exports.unansweredOnly(req, res);
    }

    // Handle unvotedOnly filter
    if (unvotedOnly) {
      return await exports.unVotedQuestions(req, res);
    }

    if (search) {
      return await exports.searchQuestions(req, res);
    }

    // Sort logic
    if (sort) {
      if (sort === "mostToLowestVoted") {
        return await exports.mostToLowestVoted(req, res);
      } else if (sort === "lowestToMostVoted") {
        return await exports.lowestToMostVoted(req, res);
      } else if (sort === "newestToOldest") {
        return await exports.newestToOldest(req, res);
      } else if (sort === "oldestToNewest") {
        return await exports.oldestToNewest(req, res);
      }
    }

    // Filter logic
    if (filter === "Newest") {
      return await exports.getNewestQuestions(req, res);
    } else if (filter === "Active") {
      return await exports.getActiveQuestions(req, res);
    } else if (filter === "UnAnswered") {
      return await exports.getUnansweredQuestions(req, res);
    } else if (filter) {
      return res.status(400).json({ message: "Invalid filter option" });
    }

    // Default case: No filter or sort provided
    return res
      .status(400)
      .json({ message: "No filter or sort option provided" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
