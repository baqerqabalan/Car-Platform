const Badge = require("../../../server/models/badgesModel");
const EarnedBadge = require("../../../server/models/earnedBadges");
const User = require("../../../server/models/userModel");

exports.getEarnedUserBadges = async (req, res) => {
  try {
    const users = await EarnedBadge.find({})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .limit(3) // Limit the results to the latest 3 entries
      .populate("userId", "firstName lastName profileImg") // Populate user details
      .populate("badgeId", "name createdAt"); // Populate badge details

    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, score } = req.body;

    const newBadge = await Badge.create({
      name,
      description,
      score,
    });

    return res
      .status(201)
      .json({ message: "Badge Created Successfully", newBadge });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, score } = req.body;
    const badgeId = req.params.badgeId;

    const badge = await Badge.findById(badgeId);

    if (!badge) {
      return res.status(404).json({ message: "Badge not found" });
    }

    if (name) badge.name = name;
    if (description) badge.description = description;
    if (score) badge.score = score;

    await badge.save();
    return res
      .status(200)
      .json({ message: "Badge Updated Successfully", badge });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.delete = async (req, res) => {
  try {
    const badgeId = req.params.badgeId;

    // Check if any user has earned this badge
    const earnedBadgeCount = await EarnedBadge.countDocuments({ badgeId });

    if (earnedBadgeCount > 0) {
      return res.status(400).json({
        message: "Badge cannot be deleted as it has been earned by users.",
      });
    }

    // Delete the badge if it has not been earned
    const badge = await Badge.findByIdAndDelete(badgeId);

    if (!badge) {
      return res.status(404).json({ message: "Badge not found" });
    }

    return res.status(200).json({ message: "Badge deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Defaults: page 1, 10 users per page

    // Fetch paginated users
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Fetch earned badges and populate related badge information
    const userIds = users.map((user) => user._id);
    const earnedBadges = await EarnedBadge.find({ userId: { $in: userIds } })
      .populate("badgeId", "name description")
      .populate("userId", "firstName lastName");

    // Merge user data with their earned badges
    const userData = users.map((user) => {
      const userBadges = earnedBadges.filter((badge) =>
        badge.userId.equals(user._id)
      );

      return {
        ...user.toObject(),
        earnedBadges: userBadges.map((badge) => ({
          badgeId: badge.badgeId._id,
          badgeName: badge.badgeId.name,
          badgeDescription: badge.badgeId.description,
          earnedAt: badge.createdAt,
        })),
      };
    });

    const totalUsers = await User.countDocuments();

    return res.status(200).json({
      users: userData,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getAllBadges = async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query;

    const badges = await Badge.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalBadges = await Badge.countDocuments();

    return res.status(200).json({
      badges,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalBadges / limit),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
