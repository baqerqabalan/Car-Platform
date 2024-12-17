const RequestSubscriptions = require("../models/requestSubscriptionModel");
const User = require("../models/userModel");
const Subscription = require("../models/subscriptionPackagesModel");
const { sendEmail } = require("../utils/email");

// Create a post in a request
exports.requestSubscription = async (req, res) => {
  try {
    const {
      title,
      description,
      skills,
      subscription,
      firstName,
      lastName,
      location,
      email,
      phoneNumber,
      experience,
      marketName,
    } = req.body;
    const requestedClientId = req.user._id;

    const userEmail = await User.findById(requestedClientId).select("email");

    if (!userEmail) {
      return res.status(404).json({ message: "User email not found" });
    }

    const image =
      req.files.image && req.files.image[0] ? req.files.image[0].path : null;

    const imagesArray = req.files.additionalImages
      ? req.files.additionalImages.map((file) => file.path)
      : []; // Additional images

    if (
      !title ||
      !firstName ||
      !lastName ||
      !location ||
      !email ||
      !phoneNumber ||
      !marketName ||
      !description ||
      !experience
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create the request
    const request = await RequestSubscriptions.create({
      title,
      description,
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      marketName, // corrected from marketPlace to marketName
      experience,
      skills,
      image,
      additionalImages: imagesArray,
      requestedClientId,
      subscription,
      status: "pending",
    });

    if (request) {
      try {
        const mailOptions = {
          email: userEmail.email,
          subject: "Request Sent",
          message: `Your request has been successfully sent to the admin for approval. Please allow up to 3 days to receive either an approval or rejection response.`,
        };
        await sendEmail(mailOptions);
      } catch (error) {
        console.log("Error sending the email: ", error);
      }
    }

    return res
      .status(201)
      .json({ message: "Request Created Successfully", data: request });
  } catch (error) {
    console.error("Error creating request:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.checkPreviousRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.find(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const request = await RequestSubscriptions.findOne({
      requestedClientId: userId,
      status: "pending",
    });

    if (!request) {
      return res.status(200).json({ message: "Request Not Found" });
    }

    return res.status(200).json({ message: "Request Found" });
  } catch (error) {
    console.error("Error checking previous request of the user:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Backend: Modify the getProposals endpoint to support pagination
exports.getApprovedProposals = async (req, res) => {
  const { page = 1, limit = 3 } = req.query; // Set default values for page and limit

  try {
    const proposals = await RequestSubscriptions.find({ status: "approved" })
      .skip((page - 1) * limit) // Skip the documents of previous pages
      .limit(Number(limit)); // Limit the number of documents per page

    // Fetch users associated with the proposals
    const userIds = proposals.map((p) => p.requestedClientId);
    const users = await User.find({ _id: { $in: userIds } });

    if (!proposals.length) {
      return res.status(404).json({ message: "Proposals not found" });
    }

    return res.status(200).json({
      proposals,
      users,
      currentPage: page,
      totalProposals: await RequestSubscriptions.countDocuments({
        status: "approved",
      }),
    });
  } catch (error) {
    console.error("Error fetching the proposals:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getProposalById = async (req, res) => {
  try {
    const proposalId = req.params.proposalId;

    // Find the proposal by ID
    const proposal = await RequestSubscriptions.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Find the user linked to the proposal
    const user = await User.findById(proposal.requestedClientId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subscription = await Subscription.findById(proposal.subscription);

    if (!subscription) {
      return res.status(400).json({ message: "Subscription Not Found" });
    }

    // Return the combined data under a single 'proposal' key
    return res.status(200).json({
      proposal: {
        ...proposal.toObject(), // Convert to plain object if needed
        subscription: {
          title: subscription.title,
        },
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImg,
          phoneNumber: user.phoneNumber,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const path = require("path"); // Import the path module

exports.updateSubscriptionDetails = async (req, res) => {
  try {
    const proposalId = req.params.proposalId;
    const proposal = await RequestSubscriptions.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const {
      title,
      description,
      marketName,
      location,
      experience,
      skills,
      firstName,
      lastName,
      phoneNumber,
      email,
      deletedImages
    } = req.body;

    // Update proposal fields
    if (title) proposal.title = title;
    if (description) proposal.description = description;
    if (marketName) proposal.marketName = marketName;
    if (location) proposal.location = location;
    if (experience) proposal.experience = experience;
    if (skills) proposal.skills = skills;
    if (firstName) proposal.firstName = firstName;
    if (lastName) proposal.lastName = lastName;
    if (phoneNumber) proposal.phoneNumber = phoneNumber;
    if (email) proposal.email = email;

    // Handle image fields
    if (req.files.image && req.files.image[0]) {
      proposal.image = req.files.image[0].path; // Update main image
    }

    const newImages =
    req.files && req.files.additionalImages
      ? req.files.additionalImages.map((file) => file.path)
      : []; // New additional images

    // Remove deleted images from the product's images array
    if (deletedImages && deletedImages.length > 0) {
      proposal.additionalImages= proposal.additionalImages.filter(
        (img) => !deletedImages.includes(img)
      );
    }

    // Add new images to the existing ones
    if (newImages.length > 0) {
      proposal.additionalImages = proposal.additionalImages.concat(newImages); // Append new images to the existing array
    }

    await proposal.save();

    return res
      .status(200)
      .json({ message: "Proposal updated successfully", proposal });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
