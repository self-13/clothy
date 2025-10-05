const Order = require("../../models/Order");
const User = require("../../models/User");
const Product = require("../../models/Product");
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

// ✅ Enhanced: Get all orders with advanced filtering
const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      paymentMethod,
      startDate,
      endDate,
      search,
    } = req.query;

    let filters = {};

    // Status filter
    if (status && status !== "all") {
      filters.orderStatus = status;
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== "all") {
      filters.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      filters.orderDate = {};
      if (startDate) filters.orderDate.$gte = new Date(startDate);
      if (endDate) filters.orderDate.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      filters.$or = [
        { _id: search },
        { "addressInfo.name": { $regex: search, $options: "i" } },
        { "addressInfo.phone": { $regex: search, $options: "i" } },
        { razorpayOrderId: search },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filters)
      .populate("userId", "name email phone")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filters);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const paymentStats = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const stats = {
      total: totalOrders,
      totalRevenue: orderStats.reduce(
        (sum, stat) => sum + stat.totalRevenue,
        0
      ),
      byStatus: {},
      byPayment: {},
    };

    orderStats.forEach((stat) => {
      stats.byStatus[stat._id] = {
        count: stat.count,
        revenue: stat.totalRevenue,
      };
    });

    paymentStats.forEach((stat) => {
      stats.byPayment[stat._id] = {
        count: stat.count,
        revenue: stat.totalAmount,
      };
    });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
      stats,
    });
  } catch (e) {
    console.log("Error in getAllOrdersOfAllUsers:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching orders",
    });
  }
};

// ✅ Enhanced: Get order details for admin
const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { id } = req.params;

    const order = await Order.findById(id).populate(
      "userId",
      "name email phone createdAt"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Get product details for each item
    const populatedItems = await Promise.all(
      order.items.map(async (item) => {
        const product = await Product.findById(item.productId).select(
          "images colors sizes category subcategory brand isActive"
        );

        return {
          ...item.toObject(),
          productDetails: product,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        items: populatedItems,
      },
    });
  } catch (e) {
    console.log("Error in getOrderDetailsForAdmin:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching order details",
    });
  }
};

// ✅ Enhanced: Update order status with tracking
const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { id } = req.params;
    const { orderStatus, tracking } = req.body;

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

    // Update tracking information if provided
    if (tracking) {
      order.tracking = { ...order.tracking, ...tracking };
    }

    // Set delivery date when status changes to "delivered"
    if (orderStatus === "delivered" && !order.deliveryDate) {
      order.deliveryDate = new Date();
    }

    // Set estimated delivery for shipped orders
    if (orderStatus === "shipped" && !order.estimatedDelivery) {
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 3); // 3 days from shipping
      order.estimatedDelivery = estimatedDate;
    }

    await order.save();

    // Send status update email to customer if status changed
    if (oldStatus !== orderStatus) {
      try {
        const user = await User.findById(order.userId);
        if (user) {
          await sendOrderStatusUpdateEmail(user.email, user.name, {
            orderId: order._id,
            orderDate: order.orderDate,
            orderStatus: orderStatus,
            totalAmount: order.totalAmount,
            items: order.items,
            addressInfo: order.addressInfo,
            deliveryDate: order.deliveryDate,
            tracking: order.tracking,
            estimatedDelivery: order.estimatedDelivery,
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

// ✅ Enhanced: Get cancellation requests with filters
const getCancellationRequests = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { status = "pending", page = 1, limit = 20 } = req.query;

    const filters = {
      "cancellation.requested": true,
      "cancellation.status": status,
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const cancellationRequests = await Order.find(filters)
      .populate("userId", "name email phone")
      .sort({ "cancellation.requestedAt": -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalRequests = await Order.countDocuments(filters);
    const totalPages = Math.ceil(totalRequests / parseInt(limit));

    res.status(200).json({
      success: true,
      data: cancellationRequests,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRequests,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (e) {
    console.log("Error in getCancellationRequests:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching cancellation requests",
    });
  }
};

// ✅ Enhanced: Get return requests with filters
const getReturnRequests = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { status = "pending", page = 1, limit = 20 } = req.query;

    const filters = {
      "return.requested": true,
      "return.status": status,
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const returnRequests = await Order.find(filters)
      .populate("userId", "name email phone")
      .sort({ "return.requestedAt": -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalRequests = await Order.countDocuments(filters);
    const totalPages = Math.ceil(totalRequests / parseInt(limit));

    res.status(200).json({
      success: true,
      data: returnRequests,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRequests,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (e) {
    console.log("Error in getReturnRequests:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching return requests",
    });
  }
};

// ✅ Enhanced: Update cancellation status with partial cancellation support
const updateCancellationStatus = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { id } = req.params;
    const { status, refundAmount, adminNotes, cancelledItems } = req.body;

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
    order.cancellation.adminNotes = adminNotes;

    if (refundAmount) {
      order.cancellation.refundAmount = refundAmount;
    }

    // If approved, update order status and restore stock
    if (status === "approved") {
      // If specific items are cancelled, handle partial cancellation
      if (cancelledItems && cancelledItems.length > 0) {
        // Partial cancellation logic
        order.items = order.items.filter(
          (item) => !cancelledItems.includes(item._id.toString())
        );

        // Update total amount
        order.totalAmount = order.items.reduce((total, item) => {
          return total + (item.salePrice || item.price) * item.quantity;
        }, order.shippingFee + order.cashHandlingFee);

        // Restore stock only for cancelled items
        for (let itemId of cancelledItems) {
          const item = order.items.id(itemId);
          if (item) {
            const product = await Product.findById(item.productId);
            if (product) {
              const sizeItem = product.sizes.find(
                (s) => s.size === item.selectedSize
              );
              if (sizeItem) {
                sizeItem.stock += item.quantity;
                product.totalStock = product.sizes.reduce(
                  (total, s) => total + s.stock,
                  0
                );
                product.salesCount = Math.max(
                  0,
                  product.salesCount - item.quantity
                );
                await product.save();
              }
            }
          }
        }

        // If all items are cancelled, mark order as cancelled
        if (order.items.length === 0) {
          order.orderStatus = "cancelled";
        }
      } else {
        // Full cancellation
        order.orderStatus = "cancelled";

        // Restore stock for all items
        for (let item of order.items) {
          let product = await Product.findById(item.productId);
          if (product) {
            const sizeItem = product.sizes.find(
              (s) => s.size === item.selectedSize
            );
            if (sizeItem) {
              sizeItem.stock += item.quantity;
              product.totalStock = product.sizes.reduce(
                (total, s) => total + s.stock,
                0
              );
              product.salesCount = Math.max(
                0,
                product.salesCount - item.quantity
              );
              await product.save();
            }
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
        await sendCancellationStatusEmail(user.email, user.name, {
          orderId: order._id,
          requestDate: order.cancellation.requestedAt,
          reason: order.cancellation.reason,
          status: order.cancellation.status,
          refundAmount: order.cancellation.refundAmount,
          adminNotes: order.cancellation.adminNotes,
          isPartial: cancelledItems && cancelledItems.length > 0,
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

// ✅ Enhanced: Update return status with partial return support
const updateReturnStatus = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { id } = req.params;
    const { status, refundAmount, pickupAddress, adminNotes, returnedItems } =
      req.body;

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
    order.return.adminNotes = adminNotes;

    if (refundAmount) {
      order.return.refundAmount = refundAmount;
    }

    if (pickupAddress) {
      order.return.pickupAddress = pickupAddress;
    }

    // If approved, update order status and restore stock
    if (status === "approved") {
      // If specific items are returned, handle partial return
      if (returnedItems && returnedItems.length > 0) {
        // Partial return logic
        order.items = order.items.filter(
          (item) => !returnedItems.includes(item._id.toString())
        );

        // Update total amount
        order.totalAmount = order.items.reduce((total, item) => {
          return total + (item.salePrice || item.price) * item.quantity;
        }, order.shippingFee + order.cashHandlingFee);

        // Restore stock only for returned items
        for (let itemId of returnedItems) {
          const item = order.items.id(itemId);
          if (item) {
            const product = await Product.findById(item.productId);
            if (product) {
              const sizeItem = product.sizes.find(
                (s) => s.size === item.selectedSize
              );
              if (sizeItem) {
                sizeItem.stock += item.quantity;
                product.totalStock = product.sizes.reduce(
                  (total, s) => total + s.stock,
                  0
                );
                product.salesCount = Math.max(
                  0,
                  product.salesCount - item.quantity
                );
                await product.save();
              }
            }
          }
        }

        // If all items are returned, mark order as returned
        if (order.items.length === 0) {
          order.orderStatus = "returned";
        }
      } else {
        // Full return
        order.orderStatus = "returned";

        // Restore stock for all items
        for (let item of order.items) {
          let product = await Product.findById(item.productId);
          if (product) {
            const sizeItem = product.sizes.find(
              (s) => s.size === item.selectedSize
            );
            if (sizeItem) {
              sizeItem.stock += item.quantity;
              product.totalStock = product.sizes.reduce(
                (total, s) => total + s.stock,
                0
              );
              product.salesCount = Math.max(
                0,
                product.salesCount - item.quantity
              );
              await product.save();
            }
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
        await sendReturnStatusEmail(user.email, user.name, {
          orderId: order._id,
          requestDate: order.return.requestedAt,
          reason: order.return.reason,
          status: order.return.status,
          refundAmount: order.return.refundAmount,
          pickupAddress: order.return.pickupAddress,
          adminNotes: order.return.adminNotes,
          isPartial: returnedItems && returnedItems.length > 0,
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

// ✅ Enhanced: Get all pending requests with counts
const getAllPendingRequests = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

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
      .populate("userId", "name email phone")
      .sort({ "cancellation.requestedAt": -1 })
      .limit(10);

    const pendingReturns = await Order.find({
      "return.requested": true,
      "return.status": "pending",
    })
      .populate("userId", "name email phone")
      .sort({ "return.requestedAt": -1 })
      .limit(10);

    // Get counts for dashboard
    const cancellationCount = await Order.countDocuments({
      "cancellation.requested": true,
      "cancellation.status": "pending",
    });

    const returnCount = await Order.countDocuments({
      "return.requested": true,
      "return.status": "pending",
    });

    res.status(200).json({
      success: true,
      data: {
        cancellations: pendingCancellations,
        returns: pendingReturns,
        counts: {
          cancellations: cancellationCount,
          returns: returnCount,
          totalPending: cancellationCount + returnCount,
        },
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

// ✅ New: Get order analytics
const getOrderAnalytics = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { period = "30days" } = req.query;
    let startDate = new Date();

    switch (period) {
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "1year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Revenue analytics
    const revenueStats = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
            day: { $dayOfMonth: "$orderDate" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Order status distribution
    const statusDistribution = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Payment method distribution
    const paymentDistribution = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
          orderStatus: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.title" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        revenueStats,
        statusDistribution,
        paymentDistribution,
        topProducts,
        summary: {
          totalRevenue: revenueStats.reduce(
            (sum, stat) => sum + stat.totalRevenue,
            0
          ),
          totalOrders: revenueStats.reduce(
            (sum, stat) => sum + stat.orderCount,
            0
          ),
          averageOrderValue:
            revenueStats.reduce(
              (sum, stat) => sum + stat.averageOrderValue,
              0
            ) / revenueStats.length,
        },
      },
    });
  } catch (e) {
    console.log("Error in getOrderAnalytics:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching order analytics",
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
  getOrderAnalytics,
};
