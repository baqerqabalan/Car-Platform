const User = require("../../../server/models/adminModel");
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const userCheck = async (req) => {
  const identifier = req.body.username;
  const user = await User.findOne({ username: identifier });
  return user;
};

// Function to sign a JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Function to create and send a response with a JWT token
const createSendToken = (user, statusCode, message, res) => {
  const token = signToken(user._id);
  // Make sure to exclude sensitive information from the response
  const { password, ...userData } = user.toObject();
  
  return res.status(statusCode).json({
    status: "success",
    token,
    message,
    data: { user: userData },
  });
};

exports.login = async (req, res) => {
  try {
    const user = await userCheck(req);

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    
    const isPasswordCorrect = await user.checkPassword(
      req.body["password"],
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    createSendToken(user, 200, "Logged in successfully", res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    // 1. Check whether the token exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If there's no token, allow the request to proceed with user as null
    if (!token) {
      req.user = null; // Explicitly set user to null
      return next(); // Allow the request to proceed
    }

    // 2. Verify the token
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token, please log in again" });
      } else if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Your session expired, Log in again" });
      }
      return res.status(500).json({ message: "Token verification failed" });
    }

    // 3. Check if the token holder exists in the database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(404).json({ message: "The token holder doesn't exist" });
    }

    // 4. Check if the user changed their password after the token was issued
    if (currentUser.passwordChangedAfterIssuingToken(decoded.iat)) {
      return res.status(401).json({
        message: "You recently changed your password, please log in again",
      });
    }

    // 5. Save the user in the request object and proceed
    req.user = currentUser;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};