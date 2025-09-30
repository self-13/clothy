const Order = require("../../models/Order");
const User = require("../../models/User");
const { sendOrderStatusUpdateEmail } = require("../../helpers/emailService");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === "admin";
  } catch (error) {
    console.log("Role check error:", error);
    return false;
  }
};

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    // FIX: Get user ID from header
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const orders = await Order.find({}).sort({ orderDate: -1 });

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
    console.log("Error in getAllOrdersOfAllUsers:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching orders",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    // FIX: Get user ID from header
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

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
    console.log("Error in getOrderDetailsForAdmin:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching order details",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    // FIX: Get user ID from header
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    const oldStatus = order.orderStatus;

    // Update the order status
    order.orderStatus = orderStatus;
    await order.save();

    if (oldStatus !== orderStatus) {
      try {
        const user = await User.findById(order.userId);
        if (user) {
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
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
      data: order,
    });
  } catch (e) {
    console.log("Error in updateOrderStatus:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating order status",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
