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
          <p>Best regards,<br>Luxeridge Fashion Team</p>
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
          <p>Best regards,<br>Luxeridge Fashion Team</p>
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
          <p>Best regards,<br>Luxeridge Fashion Team</p>
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
          <p>Best regards,<br>Luxeridge Fashion Team</p>
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

// Send order status update email to customer
const sendOrderStatusUpdateEmail = async (email, userName, orderDetails) => {
  try {
    console.log(`Attempting to send order status update to: ${email}`);

    // Map status to friendly messages
    const statusMessages = {
      confirmed: "has been confirmed and is being processed",
      processing: "is now being processed",
      shipped: "has been shipped",
      out_for_delivery: "is out for delivery",
      delivered: "has been delivered",
      rejected: "has been rejected",
    };

    const statusMessage =
      statusMessages[orderDetails.orderStatus] || "status has been updated";

    const { data, error } = await resend.emails.send({
      from:
        process.env.FROM_EMAIL || "E-commerce Store <onboarding@resend.dev>",
      to: email,
      subject: `Order ${orderDetails.orderStatus} - #${orderDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Status Updated!</h2>
          <p>Dear ${userName},</p>
          <p>Your order #${orderDetails.orderId} ${statusMessage}.</p>
          
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Order Date:</strong> ${new Date(
            orderDetails.orderDate
          ).toLocaleDateString()}</p>
          <p><strong>New Status:</strong> ${orderDetails.orderStatus
            .toUpperCase()
            .replace("_", " ")}</p>
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
          <p>Best regards,<br>Luxeridge Fashion Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending order status update email:", error);
      return false;
    }

    console.log("Order status update email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Error sending order status update email:", error);
    return false;
  }
};

// Send cancellation request email to admin
const sendCancellationRequestEmail = async (adminEmail, requestDetails) => {
  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.FROM_EMAIL || "E-commerce Store <onboarding@resend.dev>",
      to: adminEmail,
      subject: `Cancellation Request - Order #${requestDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Cancellation Request Received</h2>
          <p>A customer has requested to cancel their order.</p>
          
          <h3>Request Details:</h3>
          <p><strong>Order ID:</strong> ${requestDetails.orderId}</p>
          <p><strong>Customer:</strong> ${requestDetails.userName} (${
        requestDetails.userEmail
      })</p>
          <p><strong>Request Date:</strong> ${new Date(
            requestDetails.requestDate
          ).toLocaleDateString()}</p>
          <p><strong>Reason:</strong> ${requestDetails.reason}</p>
          
          <h3>Order Details:</h3>
          <p><strong>Order Date:</strong> ${new Date(
            requestDetails.orderDate
          ).toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${requestDetails.paymentMethod.toUpperCase()}</p>
          <p><strong>Total Amount:</strong> ₹${requestDetails.totalAmount}</p>
          
          <h3>Shipping Address:</h3>
          <p>${requestDetails.addressInfo.name}<br>
          ${requestDetails.addressInfo.address}<br>
          ${requestDetails.addressInfo.city}, ${
        requestDetails.addressInfo.state
      } - ${requestDetails.addressInfo.pincode}<br>
          Phone: ${requestDetails.addressInfo.phone}</p>
          
          <p>Please review this cancellation request in the admin panel.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending cancellation request email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending cancellation request email:", error);
    return false;
  }
};

// Send cancellation status update to customer
const sendCancellationStatusEmail = async (email, userName, statusDetails) => {
  try {
    const statusMessages = {
      approved: "has been approved",
      rejected: "has been rejected",
    };

    const statusMessage =
      statusMessages[statusDetails.status] || "status has been updated";

    const { data, error } = await resend.emails.send({
      from:
        process.env.FROM_EMAIL || "E-commerce Store <onboarding@resend.dev>",
      to: email,
      subject: `Cancellation Request ${statusDetails.status} - Order #${statusDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Cancellation Request Update</h2>
          <p>Dear ${userName},</p>
          <p>Your cancellation request for order #${
            statusDetails.orderId
          } ${statusMessage}.</p>
          
          <h3>Request Details:</h3>
          <p><strong>Order ID:</strong> ${statusDetails.orderId}</p>
          <p><strong>Request Date:</strong> ${new Date(
            statusDetails.requestDate
          ).toLocaleDateString()}</p>
          <p><strong>Reason:</strong> ${statusDetails.reason}</p>
          <p><strong>Status:</strong> ${statusDetails.status.toUpperCase()}</p>
          ${
            statusDetails.refundAmount
              ? `<p><strong>Refund Amount:</strong> ₹${statusDetails.refundAmount}</p>`
              : ""
          }
          ${
            statusDetails.adminNotes
              ? `<p><strong>Admin Notes:</strong> ${statusDetails.adminNotes}</p>`
              : ""
          }
          
          <p>If you have any questions, please contact our support team.</p>
          <br>
          <p>Best regards,<br>Luxeridge Fashion Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending cancellation status email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending cancellation status email:", error);
    return false;
  }
};

// Send return request email to admin
const sendReturnRequestEmail = async (adminEmail, requestDetails) => {
  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.FROM_EMAIL || "E-commerce Store <onboarding@resend.dev>",
      to: adminEmail,
      subject: `Return Request - Order #${requestDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Return Request Received</h2>
          <p>A customer has requested to return their order.</p>
          
          <h3>Request Details:</h3>
          <p><strong>Order ID:</strong> ${requestDetails.orderId}</p>
          <p><strong>Customer:</strong> ${requestDetails.userName} (${
        requestDetails.userEmail
      })</p>
          <p><strong>Request Date:</strong> ${new Date(
            requestDetails.requestDate
          ).toLocaleDateString()}</p>
          <p><strong>Reason:</strong> ${requestDetails.reason}</p>
          
          <h3>Order Details:</h3>
          <p><strong>Order Date:</strong> ${new Date(
            requestDetails.orderDate
          ).toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${requestDetails.paymentMethod.toUpperCase()}</p>
          <p><strong>Total Amount:</strong> ₹${requestDetails.totalAmount}</p>
          
          <h3>Shipping Address:</h3>
          <p>${requestDetails.addressInfo.name}<br>
          ${requestDetails.addressInfo.address}<br>
          ${requestDetails.addressInfo.city}, ${
        requestDetails.addressInfo.state
      } - ${requestDetails.addressInfo.pincode}<br>
          Phone: ${requestDetails.addressInfo.phone}</p>
          
          <p>Please review this return request in the admin panel.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending return request email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending return request email:", error);
    return false;
  }
};

// Send return status update to customer
const sendReturnStatusEmail = async (email, userName, statusDetails) => {
  try {
    const statusMessages = {
      approved: "has been approved",
      rejected: "has been rejected",
    };

    const statusMessage =
      statusMessages[statusDetails.status] || "status has been updated";

    const { data, error } = await resend.emails.send({
      from:
        process.env.FROM_EMAIL || "E-commerce Store <onboarding@resend.dev>",
      to: email,
      subject: `Return Request ${statusDetails.status} - Order #${statusDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Return Request Update</h2>
          <p>Dear ${userName},</p>
          <p>Your return request for order #${
            statusDetails.orderId
          } ${statusMessage}.</p>
          
          <h3>Request Details:</h3>
          <p><strong>Order ID:</strong> ${statusDetails.orderId}</p>
          <p><strong>Request Date:</strong> ${new Date(
            statusDetails.requestDate
          ).toLocaleDateString()}</p>
          <p><strong>Reason:</strong> ${statusDetails.reason}</p>
          <p><strong>Status:</strong> ${statusDetails.status.toUpperCase()}</p>
          ${
            statusDetails.refundAmount
              ? `<p><strong>Refund Amount:</strong> ₹${statusDetails.refundAmount}</p>`
              : ""
          }
          ${
            statusDetails.pickupAddress
              ? `
          <h3>Pickup Address:</h3>
          <p>${statusDetails.pickupAddress.address}<br>
          ${statusDetails.pickupAddress.city}, ${statusDetails.pickupAddress.state} - ${statusDetails.pickupAddress.pincode}</p>
          `
              : ""
          }
          ${
            statusDetails.adminNotes
              ? `<p><strong>Admin Notes:</strong> ${statusDetails.adminNotes}</p>`
              : ""
          }
          
          <p>If you have any questions, please contact our support team.</p>
          <br>
          <p>Best regards,<br>Luxeridge Fashion Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending return status email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending return status email:", error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendNewOrderNotificationEmail,
  sendOrderStatusUpdateEmail,
  sendCancellationRequestEmail,
  sendCancellationStatusEmail,
  sendReturnRequestEmail,
  sendReturnStatusEmail,
};
