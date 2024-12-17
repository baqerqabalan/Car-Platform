const moment = require("moment");
const Question = require("../../../server/models/questionModel");
const Answer = require("../../../server/models/answerModel");
const Voting = require("../../../server/models/votingsModel");
const User = require("../../../server/models/userModel");
const Sale = require("../../../server/models/salesModel");
const Bid = require("../../../server/models/bidModel");
const Product = require("../../../server/models/productPostModel");
const Message = require("../../../server/models/contactModel");

// Helper function to get activity counts based on specific time periods
const getActivityCount = async (model, startOfPeriod, endOfPeriod) => {
  return await model.countDocuments({
    createdAt: { $gte: startOfPeriod.toDate(), $lt: endOfPeriod.toDate() }, // Filter by creation date within the range
  });
};

// Function to get the activity data based on the period (daily, weekly, monthly)
const getActivityData = async (period) => {
  const now = moment().utc();
  let startOfPeriod, labelFormat, unit;

  // Determine the start of the period and format for labels
  if (period === "daily") {
    startOfPeriod = now.startOf("day");
    labelFormat = "h:mm A"; // Time format (e.g., 12:00 PM)
    unit = "hours";
  } else if (period === "weekly") {
    startOfPeriod = now.startOf("week");
    labelFormat = "dddd"; // Day of the week format (e.g., Monday)
    unit = "days";
  } else if (period === "monthly") {
    startOfPeriod = now.startOf("year");
    labelFormat = "MMMM"; // Month format (e.g., January)
    unit = "months";
  }

  // Define the models to be considered for activity count
  const models = [Question, Answer, Voting, User, Sale, Bid, Product, Message];

  // Generate time labels based on the period
  const timeLabels = [];
  const periodCount = period === "daily" ? 24 : period === "weekly" ? 7 : 12;
  for (let i = 0; i < periodCount; i++) {
    const labelStart = moment(startOfPeriod).add(i, unit).utc();
    const labelEnd = moment(labelStart).add(1, unit).utc();
    timeLabels.push({
      label: labelStart.format(labelFormat),
      start: labelStart,
      end: labelEnd,
    });
  }

  // Calculate the total activity count for each time label
  const activityCounts = await Promise.all(
    timeLabels.map(async ({ label, start, end }, index) => {
      const totalCount = await Promise.all(
        models.map(async (model) => {
          return getActivityCount(model, start, end);
        })
      );
      return { label, value: totalCount.reduce((sum, count) => sum + count, 0) };
    })
  );

  return activityCounts;
};

// Route handler
exports.getActivity = async (req, res) => {
  const { timePeriod } = req.query;

  try {
    const response = await getActivityData(timePeriod);

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};