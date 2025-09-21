const Order = require("../../models/Order");
const User = require("../../models/User"); // Import User model
const { sendOrderStatusUpdateEmail } = require("../../helpers/emailService"); // Import the email function

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Save the old status for comparison
    const oldStatus = order.orderStatus;

    // Update the order status
    await Order.findByIdAndUpdate(id, { orderStatus });

    // Only send email if status actually changed
    if (oldStatus !== orderStatus) {
      try {
        // Get user details for email
        const user = await User.findById(order.userId);
        if (user) {
          // Send order status update email to customer
          await sendOrderStatusUpdateEmail(user.email, user.name, {
            orderId: order._id,
            orderDate: order.orderDate,
            orderStatus: orderStatus,
            totalAmount: order.totalAmount,
            addressInfo: order.addressInfo,
          });
        }
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
        // Don't fail the order update if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
