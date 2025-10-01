const Order = require("../../models/Order");
const User = require("../../models/User");
const Product = require("../../models/Product"); // ✅ Added missing import
const {
  sendOrderStatusUpdateEmail,
  sendCancellationStatusEmail,
  sendReturnStatusEmail,
} = require("../../helpers/emailService");

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

// ✅ Update order status with delivery date handling
const updateOrderStatus = async (req, res) => {
  try {
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
    order.orderUpdateDate = new Date();

    // ✅ Set delivery date when status changes to "delivered"
    if (orderStatus === "delivered" && !order.deliveryDate) {
      order.deliveryDate = new Date();
    }

    await order.save();

    if (oldStatus !== orderStatus) {
      try {
        const user = await User.findById(order.userId);
        if (user) {
          await sendOrderStatusUpdateEmail(user.email, user.userName, {
            orderId: order._id,
            orderDate: order.orderDate,
            orderStatus: orderStatus,
            totalAmount: order.totalAmount,
            addressInfo: order.addressInfo,
            deliveryDate: order.deliveryDate, // ✅ Include delivery date in email
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

// ✅ Get all cancellation requests
const getCancellationRequests = async (req, res) => {
  try {
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

    const cancellationRequests = await Order.find({
      "cancellation.requested": true,
    })
      .populate("userId", "userName email")
      .sort({ "cancellation.requestedAt": -1 });

    res.status(200).json({
      success: true,
      data: cancellationRequests,
    });
  } catch (e) {
    console.log("Error in getCancellationRequests:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching cancellation requests",
    });
  }
};

// ✅ Get all return requests
const getReturnRequests = async (req, res) => {
  try {
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

    const returnRequests = await Order.find({
      "return.requested": true,
    })
      .populate("userId", "userName email")
      .sort({ "return.requestedAt": -1 });

    res.status(200).json({
      success: true,
      data: returnRequests,
    });
  } catch (e) {
    console.log("Error in getReturnRequests:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching return requests",
    });
  }
};

// ✅ Update cancellation status
const updateCancellationStatus = async (req, res) => {
  try {
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
    const { status, refundAmount, adminNotes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    const order = await Order.findById(id);
    if (!order || !order.cancellation.requested) {
      return res.status(404).json({
        success: false,
        message: "Cancellation request not found",
      });
    }

    // Update cancellation status
    order.cancellation.status = status;
    order.cancellation.processedAt = new Date();
    order.cancellation.processedBy = userId;

    if (refundAmount) {
      order.cancellation.refundAmount = refundAmount;
    }

    // If approved, update order status to cancelled and restore stock
    if (status === "approved") {
      order.orderStatus = "cancelled";

      // Restore stock for each product
      for (let item of order.cartItems) {
        let product = await Product.findById(item.productId);
        if (product) {
          const sizeItem = product.sizes.find(
            (s) => s.size === item.selectedSize
          );
          if (sizeItem) {
            sizeItem.stock += item.quantity;

            // Update total stock
            const totalStockFromSizes = product.sizes.reduce(
              (total, s) => total + s.stock,
              0
            );
            product.totalStock = totalStockFromSizes;

            // Update sales count
            product.salesCount = Math.max(
              0,
              product.salesCount - item.quantity
            );

            await product.save();
          }
        }
      }
    }

    order.orderUpdateDate = new Date();
    await order.save();

    // Send cancellation status email to customer
    try {
      const user = await User.findById(order.userId);
      if (user) {
        await sendCancellationStatusEmail(user.email, user.userName, {
          orderId: order._id,
          requestDate: order.cancellation.requestedAt,
          reason: order.cancellation.reason,
          status: order.cancellation.status,
          refundAmount: order.cancellation.refundAmount,
          adminNotes: adminNotes,
        });
      }
    } catch (emailError) {
      console.error("Failed to send cancellation status email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: `Cancellation request ${status} successfully`,
      data: order.cancellation,
    });
  } catch (e) {
    console.log("Error in updateCancellationStatus:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating cancellation status",
    });
  }
};

// ✅ Update return status
const updateReturnStatus = async (req, res) => {
  try {
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
    const { status, refundAmount, pickupAddress, adminNotes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    const order = await Order.findById(id);
    if (!order || !order.return.requested) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    // Update return status
    order.return.status = status;
    order.return.processedAt = new Date();
    order.return.processedBy = userId;

    if (refundAmount) {
      order.return.refundAmount = refundAmount;
    }

    if (pickupAddress) {
      order.return.pickupAddress = pickupAddress;
    }

    // If approved, update order status to returned and restore stock
    if (status === "approved") {
      order.orderStatus = "returned";

      // Restore stock for each product
      for (let item of order.cartItems) {
        let product = await Product.findById(item.productId);
        if (product) {
          const sizeItem = product.sizes.find(
            (s) => s.size === item.selectedSize
          );
          if (sizeItem) {
            sizeItem.stock += item.quantity;

            // Update total stock
            const totalStockFromSizes = product.sizes.reduce(
              (total, s) => total + s.stock,
              0
            );
            product.totalStock = totalStockFromSizes;

            // Update sales count
            product.salesCount = Math.max(
              0,
              product.salesCount - item.quantity
            );

            await product.save();
          }
        }
      }
    }

    order.orderUpdateDate = new Date();
    await order.save();

    // Send return status email to customer
    try {
      const user = await User.findById(order.userId);
      if (user) {
        await sendReturnStatusEmail(user.email, user.userName, {
          orderId: order._id,
          requestDate: order.return.requestedAt,
          reason: order.return.reason,
          status: order.return.status,
          refundAmount: order.return.refundAmount,
          pickupAddress: order.return.pickupAddress,
          adminNotes: adminNotes,
        });
      }
    } catch (emailError) {
      console.error("Failed to send return status email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: `Return request ${status} successfully`,
      data: order.return,
    });
  } catch (e) {
    console.log("Error in updateReturnStatus:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating return status",
    });
  }
};

// ✅ Get all pending requests (cancellations + returns)
const getAllPendingRequests = async (req, res) => {
  try {
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

    const pendingCancellations = await Order.find({
      "cancellation.requested": true,
      "cancellation.status": "pending",
    })
      .populate("userId", "userName email")
      .sort({ "cancellation.requestedAt": -1 });

    const pendingReturns = await Order.find({
      "return.requested": true,
      "return.status": "pending",
    })
      .populate("userId", "userName email")
      .sort({ "return.requestedAt": -1 });

    res.status(200).json({
      success: true,
      data: {
        cancellations: pendingCancellations,
        returns: pendingReturns,
        totalPending: pendingCancellations.length + pendingReturns.length,
      },
    });
  } catch (e) {
    console.log("Error in getAllPendingRequests:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching pending requests",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  getCancellationRequests,
  getReturnRequests,
  updateCancellationStatus,
  updateReturnStatus,
  getAllPendingRequests,
};
