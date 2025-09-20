require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Send OTP email
const sendOTPEmail = async (email, userName, otpCode) => {
  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.FROM_EMAIL || "E-commerce Store <onboarding@resend.dev>",
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
    });

    if (error) {
      console.error("Error sending OTP email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.FROM_EMAIL || "E-commerce Store <onboarding@resend.dev>",
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
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }

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

    const { data, error } = await resend.emails.send({
      from:
        process.env.FROM_EMAIL || "E-commerce Store <onboarding@resend.dev>",
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
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

// Send order confirmation email to customer
const sendOrderConfirmationEmail = async (email, userName, orderDetails) => {
  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.FROM_EMAIL || "E-commerce Store <onboarding@resend.dev>",
      to: email,
      subject: `Order Confirmation - #${orderDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Confirmed!</h2>
          <p>Dear ${userName},</p>
          <p>Thank you for your order. Your order has been confirmed and is being processed.</p>
          
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Order Date:</strong> ${new Date(
            orderDetails.orderDate
          ).toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod.toUpperCase()}</p>
          <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
          
          <h3>Shipping Address:</h3>
          <p>${orderDetails.addressInfo.name}<br>
          ${orderDetails.addressInfo.address}<br>
          ${orderDetails.addressInfo.city}, ${
        orderDetails.addressInfo.state
      } - ${orderDetails.addressInfo.pincode}<br>
          Phone: ${orderDetails.addressInfo.phone}</p>
          
          <p>You can track your order from your account dashboard.</p>
          <br>
          <p>Best regards,<br>E-commerce Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending order confirmation email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
};

// Send new order notification email to admin
const sendNewOrderNotificationEmail = async (adminEmail, orderDetails) => {
  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.FROM_EMAIL || "E-commerce Store <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New Order Received - #${orderDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Order Received!</h2>
          <p>A new order has been placed on your e-commerce store.</p>
          
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Customer:</strong> ${orderDetails.userName} (${
        orderDetails.userEmail
      })</p>
          <p><strong>Order Date:</strong> ${new Date(
            orderDetails.orderDate
          ).toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod.toUpperCase()}</p>
          <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
          
          <h3>Shipping Address:</h3>
          <p>${orderDetails.addressInfo.name}<br>
          ${orderDetails.addressInfo.address}<br>
          ${orderDetails.addressInfo.city}, ${
        orderDetails.addressInfo.state
      } - ${orderDetails.addressInfo.pincode}<br>
          Phone: ${orderDetails.addressInfo.phone}</p>
          
          <p>Please process this order promptly.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending new order notification email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending new order notification email:", error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendNewOrderNotificationEmail,
};
