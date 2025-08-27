require("dotenv").config();
const nodemailer = require("nodemailer");

// Create transporter with your SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send OTP email
const sendOTPEmail = async (email, userName, otpCode) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Our E-commerce Store!</h2>
          <p>Dear ${userName},</p>
          <p>Thank you for registering with us. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${otpCode}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <br>
          <p>Best regards,<br>E-commerce Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Welcome to Our E-commerce Store!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Our E-commerce Store!</h2>
          <p>Dear ${userName},</p>
          <p>Thank you for verifying your email address. Your account is now active and ready to use.</p>
          <p>Start shopping now and enjoy our exclusive offers!</p>
          <br>
          <p>Best regards,<br>E-commerce Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, userName, resetToken) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Dear ${userName},</p>
          <p>We received a request to reset your password. Click the link below to reset your password:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <br>
          <p>Best regards,<br>E-commerce Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};