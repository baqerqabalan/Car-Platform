const Question = require('../../../server/models/questionModel');
const User = require('../../../server/models/userModel');
const Sale = require('../../../server/models/salesModel');

exports.Activity = async (req, res) => {
  try {
    const lastUser = await User.findOne().sort({ createdAt: -1 });
    
    const lastQuestion = await Question.findOne().sort({ createdAt: -1 });
    
    const lastSale = await Sale.findOne().sort({ createdAt: -1 });

    const now = new Date();

    const response = {
      lastUser: lastUser
        ? {
            label: "New User Registered",
            timeAgo: timeDifference(now, new Date(lastUser.createdAt)),
          }
        : null,
      lastQuestion: lastQuestion
        ? {
            label: "Last Question Added",
            timeAgo: timeDifference(now, new Date(lastQuestion.createdAt)),
          }
        : null,
      lastSale: lastSale
        ? {
            label: "Last Sale Added",
            timeAgo: timeDifference(now, new Date(lastSale.createdAt)),
          }
        : null,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:"Something went wrong" });
  }
};

const timeDifference = (current, previous) => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed / 1000)} seconds ago`;
  } else if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)} minutes ago`;
  } else if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)} hours ago`;
  } else {
    return `${Math.round(elapsed / msPerDay)} days ago`;
  }
};
