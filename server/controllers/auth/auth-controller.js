const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../../models/User");
const { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } = require("../../helpers/emailService");

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register user
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    // Check if email already exists
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({
        success: false,
        message: "User already exists with the same email! Please try again.",
      });
    }

    // Check if username already exists
    const checkUserName = await User.findOne({ userName });
    if (checkUserName) {
      return res.status(400).json({
        success: false,
        message: "Username already taken! Please choose another.",
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 12);
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      otp: {
        code: otpCode,
        expiresAt: otpExpires,
      },
    });

    await newUser.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, userName, otpCode);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Error sending verification email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration successful. Please check your email for verification code.",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: "Email already verified",
      });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this user",
      });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.userName);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: "Email already verified",
      });
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = {
      code: otpCode,
      expiresAt: otpExpires,
    };

    await user.save();

    const emailSent = await sendOTPEmail(email, user.userName, otpCode);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Error sending verification email",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const emailSent = await sendPasswordResetEmail(email, user.userName, resetToken);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Error sending password reset email",
      });
    }

    res.status(200).json({
      success: true,
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.status(400).json({
        success: false,
        message: "User doesn't exist! Please register first",
      });

    if (!checkUser.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
    if (!checkPasswordMatch)
      return res.status(400).json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// Logout user
const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  logoutUser, 
  authMiddleware, 
  verifyOTP, 
  resendOTP, 
  forgotPassword, 
  resetPassword 
};
