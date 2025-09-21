const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Joi = require("joi");
const User = require("../../models/User");
const {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../../helpers/emailService");

// ✅ Utility
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ---------------- REGISTER ----------------
const registerSchema = Joi.object({
  userName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().max(254).required(),
  password: Joi.string().min(8).max(1024).required(),
});

const registerUser = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      stripUnknown: true,
    });
    if (error)
      return res.status(400).json({ success: false, message: error.message });

    const { userName, email, password } = value;

    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }
    if (await User.findOne({ userName })) {
      return res
        .status(400)
        .json({ success: false, message: "Username already taken" });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      otp: { code: otpCode, expiresAt: otpExpires },
    });
    await newUser.save();
    const emailSent = await sendOTPEmail(email, userName, otpCode);

    if (!emailSent)
      return res
        .status(500)
        .json({ success: false, message: "Error sending OTP email" });

    res.status(200).json({
      success: true,
      message: "Registration successful. Check your email for OTP.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- LOGIN ----------------
const loginSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  password: Joi.string().min(8).max(1024).required(),
});

const loginUser = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      stripUnknown: true,
    });
    if (error)
      return res.status(400).json({ success: false, message: error.message });

    const email = String(value.email).toLowerCase().trim();
    const password = value.password;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    if (!user.isVerified)
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      },
      process.env.CLIENT_SECRET_KEY,
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: true }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: user.email,
        role: user.role,
        id: user._id,
        userName: user.userName,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- LOGOUT ----------------
const logoutUser = (req, res) => {
  res
    .clearCookie("token")
    .json({ success: true, message: "Logged out successfully" });
};

// ---------------- AUTH MIDDLEWARE ----------------
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    req.user = jwt.verify(token, process.env.CLIENT_SECRET_KEY);
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
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

    const emailSent = await sendPasswordResetEmail(
      email,
      user.userName,
      resetToken
    );

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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
};
