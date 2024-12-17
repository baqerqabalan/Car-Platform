const User = require('../models/userModel');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const crypto = require('crypto');
const { promisify } = require('util');
const path = require('path');
const sendEmail = require('../utils/email').sendEmail;
const { assignBadge } = require('./earnedBadgesController');
const { sendEmailWithUrl } = require('../utils/email');

// Function to sign a JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Function to create and send a response with a JWT token
const createSendToken = (user, statusCode, message, res) => {
    const token = signToken(user._id);
    return res.status(statusCode).json({
        status: "success",
        token,
        message,
        data: { user }
    });
};

// Helper function to check if a user exists based on username or email
const userCheck = async (req) => {
    const identifier = req.body.identifier;
    const users = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }]
    });
    return users;
};

// Function to check if a date of birth indicates an age of 18 or older
const isAdult = (dob) => {
    const currentDate = moment();
    const userDob = moment(dob, "YYYY-MM-DD");
    const age = currentDate.diff(userDob, 'years');
    return age >= 18;
};

// Signup handler
exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, username, phoneNumber, dob, email, password,  job } = req.body;
        const profileImg = req.file ? req.file.path : "null";

        // Check if user already exists
        const existingUser = await userCheck(req);
        if (existingUser) {
            return res.status(409).json({ message: "Username or email already exists" });
        }

        // Validate email address
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        // Validate date of birth
        if (!moment(dob, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({ message: "Invalid date of birth format. Use YYYY-MM-DD." });
        }

        // Check if user is 18 or older
        if (!isAdult(dob)) {
            return res.status(400).json({ message: "You must be at least 18 years old to sign up." });
        }

        // Create new user
        const newUser = await User.create({
            firstName,
            lastName,
            username,
            phoneNumber,
            dob,
            email,
            password,
            profileImg,
            job
        });

        // Send response with token
        const message = "Account Created Successfully" ;
        createSendToken(newUser, 201, message, res);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// Login handler
exports.login = async (req, res) => {
    try {
        const user = await userCheck(req);
        
        if (!user) {
            return res.status(404).json({ message: "Invalid Credentials" });
        }

        const response = await user.checkPassword(req.body["password"], user.password);

        if (!response) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        let message = "Logged in successfully";
        createSendToken(user, 200, message, res);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if current password is correct
        if (!(await user.checkPassword(req.body.initialPassword, user.password))) {
            return res.status(409).json({ message: "Wrong current password" });
        }

        // Prevent the user from reusing the old password
        if (await user.checkPassword(req.body.newPassword, user.password)) {
            return res.status(409).json({ message: "New password can't be the same as the old one" });
        }

        // Check if new password matches confirm password
        if (req.body.newPassword !== req.body.confirmPassword) {
            return res.status(409).json({ message: "New password and confirmed password don't match" });
        }

        // Update the password
        user.password = req.body.newPassword;
        await user.save();

        let message = "Password updated successfully";
        createSendToken(user, 200, message, res);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// Forgot password handler
exports.forgotPassword = async (req, res) => {
    try {
        // 1. Check whether the user exists or not
        const user = await userCheck(req);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        // 2. Generate and save password reset token
        const resetToken = await user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });  // Save the user model with the new token

        // 3. Create password reset URL
        const url = `http://localhost:3000/resetPassword/${resetToken}`;
        const message = `You forgot your password, please change it by following this URL: `;

        // 4. Send reset email
        try {
            await sendEmailWithUrl({
                email: user.email,
                subject: "Your password reset token (valid for 10 mins)",
                message: message,
                dynamicUrl: url
            });
        } catch (error) {
            // If email sending fails, reset the token and expiration fields
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: "There was an error sending the email. Try again later!" });
        }

        return res.status(200).json({ message: "The password reset link was sent to your email." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong." });
    }
};

// Reset password handler
exports.resetPassword = async (req, res) => {
    try {
        // 1. Hash the reset token from the request
        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        
        // 2. Find the user based on the hashed token and expiration
        const tokenHolder = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!tokenHolder) {
            return res.status(400).json({ message: "Token is invalid or has expired" });
        }
        if (req.body["password"] !== req.body["confirmedPassword"]) {
            return res.status(404).json({ message: "Passwords don't match" });
        }

        // 3. Update the user's password
        tokenHolder.password = req.body["password"];
        tokenHolder.passwordResetToken = undefined;
        tokenHolder.passwordResetExpires = undefined;

        await tokenHolder.save();

        let message = "Password Changed Successfully";
        createSendToken(tokenHolder, 200, message, res);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

exports.verifyToken = async(req, res) => {
    try{
         // 1. Hash the reset token from the request
         const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        
         // 2. Find the user based on the hashed token and expiration
         const tokenHolder = await User.findOne({
             passwordResetToken: hashedToken,
             passwordResetExpires: { $gt: Date.now() }
         });

         if(!tokenHolder){
            return res.status(400).json({ message: "Token is invalid or has expired" });
         }

         return res.status(200).json({message:"Token is valid and not expired yet"});
    }catch(error){
        console.log(error);
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
      }
  
      // 3. Check if the token holder exists in the database
      let currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return res.status(404).json({ message: "The token holder doesn't exist" });
      }
  
      // 4. Check if the user changed their password after the token was issued
      if (currentUser.passwordChangedAfterIssuingToken(decoded.iat)) {
        return res.status(401).json({ message: "You recently changed your password, please log in again" });
      }
  
      // 5. Save the user in the request object and proceed
      req.user = currentUser;
      next();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  };
