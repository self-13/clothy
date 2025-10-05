const razorpay = require("../../helpers/razorpay");
const crypto = require("crypto");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const {
  sendOrderConfirmationEmail,
  sendNewOrderNotificationEmail,
  sendCancellationRequestEmail,
  sendReturnRequestEmail,
  sendOrderStatusUpdateEmail,
} = require("../../helpers/emailService");
const User = require("../../models/User");

// ✅ Enhanced: Create Order with all new fields
const createOrder = async (req, res) => {
  try {
    const { totalAmount, paymentMethod, ...orderData } = req.body;

    // Validate required fields
    if (!orderData.userId || !orderData.cartItems || !orderData.addressInfo) {
      return res.status(400).json({
        success: false,
        message: "Missing required order data",
      });
    }

    // Calculate cash handling fee if COD is selected
    let finalAmount = parseFloat(totalAmount);
    let cashHandlingFee = 0;
    let shippingFee = 0;

    if (paymentMethod === "cod") {
      cashHandlingFee = 60;
      shippingFee = 40;
      finalAmount = finalAmount + cashHandlingFee + shippingFee;
    } else {
      shippingFee = 40;
      finalAmount = finalAmount + shippingFee;
    }

    // Validate stock availability for all items
    for (let item of orderData.cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.title}" not found or inactive`,
        });
      }

      const sizeItem = product.sizes.find((s) => s.size === item.selectedSize);
      if (!sizeItem) {
        return res.status(400).json({
          success: false,
          message: `Size ${item.selectedSize} not available for ${item.title}`,
        });
      }

      if (sizeItem.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${item.title} (Size: ${item.selectedSize}). Only ${sizeItem.stock} available.`,
        });
      }
    }

    if (paymentMethod === "cod") {
      // For COD, create the order directly in DB with confirmed status
      const newOrder = new Order({
        ...orderData,
        totalAmount: finalAmount,
        cashHandlingFee,
        shippingFee,
        paymentMethod,
        orderStatus: "confirmed",
        paymentStatus: "pending",
        orderDate: new Date(),
        orderUpdateDate: new Date(),
        deliveryDate: null,
        items: orderData.cartItems.map((item) => ({
          productId: item.productId,
          title: item.title,
          image: item.image,
          price: item.price,
          salePrice: item.salePrice,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          brand: item.brand,
        })),
      });

      await newOrder.save();

      // Update stock for each product and size for COD orders
      for (let item of newOrder.items) {
        let product = await Product.findById(item.productId);

        const sizeItem = product.sizes.find(
          (s) => s.size === item.selectedSize
        );
        sizeItem.stock -= item.quantity;

        // Update total stock
        const totalStockFromSizes = product.sizes.reduce(
          (total, s) => total + s.stock,
          0
        );
        product.totalStock = totalStockFromSizes;

        // Update sales count
        product.salesCount += item.quantity;

        await product.save();
      }

      // Delete cart after order confirmed for COD
      if (newOrder.cartId) {
        await Cart.findByIdAndDelete(newOrder.cartId);
      }

      // Send confirmation email to customer
      try {
        const user = await User.findById(newOrder.userId);
        if (user) {
          await sendOrderConfirmationEmail(user.email, user.name, {
            orderId: newOrder._id,
            orderDate: newOrder.orderDate,
            paymentMethod: newOrder.paymentMethod,
            totalAmount: newOrder.totalAmount,
            items: newOrder.items,
            addressInfo: newOrder.addressInfo,
            shippingFee: newOrder.shippingFee,
            cashHandlingFee: newOrder.cashHandlingFee,
          });
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      // Send notification email to admin
      try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const user = await User.findById(newOrder.userId);

        await sendNewOrderNotificationEmail(adminEmail, {
          orderId: newOrder._id,
          userName: user ? user.name : "Customer",
          userEmail: user ? user.email : "N/A",
          orderDate: newOrder.orderDate,
          paymentMethod: newOrder.paymentMethod,
          totalAmount: newOrder.totalAmount,
          items: newOrder.items,
          addressInfo: newOrder.addressInfo,
        });
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
      }

      return res.status(201).json({
        success: true,
        orderId: newOrder._id,
        paymentMethod,
        message: "COD order created successfully",
        data: newOrder,
      });
    } else {
      // For online payments, create Razorpay order
      const options = {
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          userId: orderData.userId,
          cartId: orderData.cartId,
          paymentMethod: paymentMethod,
        },
      };

      const razorpayOrder = await razorpay.orders.create(options);

      return res.status(201).json({
        success: true,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentMethod,
        orderData: {
          ...orderData,
          totalAmount: finalAmount,
          shippingFee,
          cashHandlingFee: paymentMethod === "cod" ? cashHandlingFee : 0,
        },
      });
    }
  } catch (e) {
    console.error("Order Creation Error:", e);
    res.status(500).json({
      success: false,
      message: "Error while creating order",
      error: e.message,
    });
  }
};

// ✅ Enhanced: Verify and Capture Payment
const capturePayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    console.log("Capture payment request received:", {
      razorpay_order_id,
      razorpay_payment_id,
      orderData: orderData ? "Received" : "Missing",
    });

    // Verify signature first
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.log("Signature verification failed");
      return res.status(400).json({
        success: false,
        message: "Invalid signature. Payment verification failed.",
      });
    }

    if (!orderData) {
      console.log("No orderData received");
      return res.status(400).json({
        success: false,
        message: "Missing order data for payment capture",
      });
    }

    // Create the order in DB only after successful payment verification
    const newOrder = new Order({
      userId: orderData.userId,
      cartId: orderData.cartId,
      items: orderData.cartItems.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.price,
        salePrice: item.salePrice,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        brand: item.brand,
      })),
      addressInfo: orderData.addressInfo,
      totalAmount: orderData.totalAmount,
      shippingFee: orderData.shippingFee || 0,
      cashHandlingFee: orderData.cashHandlingFee || 0,
      paymentMethod: orderData.paymentMethod,
      orderStatus: "confirmed",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      deliveryDate: null,
    });

    await newOrder.save();
    console.log("Order saved to database:", newOrder._id);

    // Update stock for each product and size
    for (let item of newOrder.items) {
      let product = await Product.findById(item.productId);

      const sizeItem = product.sizes.find((s) => s.size === item.selectedSize);
      sizeItem.stock -= item.quantity;

      // Update total stock
      const totalStockFromSizes = product.sizes.reduce(
        (total, s) => total + s.stock,
        0
      );
      product.totalStock = totalStockFromSizes;

      // Update sales count
      product.salesCount += item.quantity;

      await product.save();
      console.log(
        `Stock updated for product: ${item.title}, size: ${item.selectedSize}`
      );
    }

    // Delete cart after order confirmed
    if (newOrder.cartId) {
      await Cart.findByIdAndDelete(newOrder.cartId);
      console.log("Cart deleted:", newOrder.cartId);
    }

    // Send confirmation email to customer for online payment orders
    try {
      const user = await User.findById(newOrder.userId);
      if (user) {
        await sendOrderConfirmationEmail(user.email, user.name, {
          orderId: newOrder._id,
          orderDate: newOrder.orderDate,
          paymentMethod: newOrder.paymentMethod,
          totalAmount: newOrder.totalAmount,
          items: newOrder.items,
          addressInfo: newOrder.addressInfo,
          shippingFee: newOrder.shippingFee,
        });
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    // Send notification email to admin for online payment orders
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
      const user = await User.findById(newOrder.userId);

      await sendNewOrderNotificationEmail(adminEmail, {
        orderId: newOrder._id,
        userName: user ? user.name : "Customer",
        userEmail: user ? user.email : "N/A",
        orderDate: newOrder.orderDate,
        paymentMethod: newOrder.paymentMethod,
        totalAmount: newOrder.totalAmount,
        items: newOrder.items,
        addressInfo: newOrder.addressInfo,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Order confirmed & payment verified",
      data: newOrder,
      orderId: newOrder._id,
    });
  } catch (e) {
    console.error("Razorpay Capture Error:", e);
    res.status(500).json({
      success: false,
      message: "Error while capturing Razorpay payment",
      error: e.message,
    });
  }
};

// ✅ Enhanced: Get all orders by user with product details
const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    let filters = { userId };
    if (status && status !== "all") {
      filters.orderStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filters)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filters);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: totalOrders,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orderStats.forEach((stat) => {
      stats[stat._id] = stat.count;
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
    console.error("Get Orders Error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching orders!",
    });
  }
};

// ✅ Enhanced: Get single order details with product info
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Populate product details for each item
    const populatedItems = await Promise.all(
      order.items.map(async (item) => {
        const product = await Product.findById(item.productId).select(
          "images colors sizes isActive category subcategory"
        );

        return {
          ...item.toObject(),
          productDetails: product
            ? {
                images: product.images,
                colors: product.colors,
                sizes: product.sizes,
                isActive: product.isActive,
                category: product.category,
                subcategory: product.subcategory,
              }
            : null,
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
    console.error("Get Order Details Error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching order details!",
    });
  }
};

// ✅ Enhanced: Request Order Cancellation
const requestCancellation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, items } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (!["confirmed", "processing"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Check if cancellation is already requested
    if (order.cancellation && order.cancellation.requested) {
      return res.status(400).json({
        success: false,
        message: "Cancellation already requested for this order",
      });
    }

    // Update order with cancellation request
    order.cancellation = {
      requested: true,
      requestedAt: new Date(),
      reason: reason,
      items: items || order.items.map((item) => item._id), // Specific items to cancel
      status: "pending",
    };
    order.orderUpdateDate = new Date();

    await order.save();

    // Send cancellation request email to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
      const user = await User.findById(order.userId);

      await sendCancellationRequestEmail(adminEmail, {
        orderId: order._id,
        userName: user ? user.name : "Customer",
        userEmail: user ? user.email : "N/A",
        requestDate: order.cancellation.requestedAt,
        reason: order.cancellation.reason,
        orderDate: order.orderDate,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        items: order.items,
        addressInfo: order.addressInfo,
      });
    } catch (emailError) {
      console.error("Failed to send cancellation request email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Cancellation request submitted successfully",
      data: order.cancellation,
    });
  } catch (e) {
    console.error("Cancellation Request Error:", e);
    res.status(500).json({
      success: false,
      message: "Error while processing cancellation request",
      error: e.message,
    });
  }
};

// ✅ Enhanced: Request Order Return
const requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, items } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Return reason is required",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be returned (only delivered orders within return period)
    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be returned",
      });
    }

    // Use deliveryDate if available, otherwise use orderUpdateDate
    const deliveryDate = order.deliveryDate || order.orderUpdateDate;
    const returnDeadline = new Date(deliveryDate);
    returnDeadline.setDate(returnDeadline.getDate() + 7);

    if (new Date() > returnDeadline) {
      return res.status(400).json({
        success: false,
        message: "Return period has expired (7 days from delivery)",
      });
    }

    // Check if return is already requested
    if (order.return && order.return.requested) {
      return res.status(400).json({
        success: false,
        message: "Return already requested for this order",
      });
    }

    // Update order with return request
    order.return = {
      requested: true,
      requestedAt: new Date(),
      reason: reason,
      items: items || order.items.map((item) => item._id), // Specific items to return
      status: "pending",
    };
    order.orderUpdateDate = new Date();

    await order.save();

    // Send return request email to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
      const user = await User.findById(order.userId);

      await sendReturnRequestEmail(adminEmail, {
        orderId: order._id,
        userName: user ? user.name : "Customer",
        userEmail: user ? user.email : "N/A",
        requestDate: order.return.requestedAt,
        reason: order.return.reason,
        orderDate: order.orderDate,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        items: order.items,
        addressInfo: order.addressInfo,
      });
    } catch (emailError) {
      console.error("Failed to send return request email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Return request submitted successfully",
      data: order.return,
    });
  } catch (e) {
    console.error("Return Request Error:", e);
    res.status(500).json({
      success: false,
      message: "Error while processing return request",
      error: e.message,
    });
  }
};

// ✅ New: Track order
const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const trackingEvents = [
      {
        status: "confirmed",
        title: "Order Confirmed",
        description: "Your order has been confirmed",
        date: order.orderDate,
        completed: true,
      },
      {
        status: "processing",
        title: "Processing",
        description: "Your order is being processed",
        date: order.orderStatus === "processing" ? order.orderUpdateDate : null,
        completed: [
          "processing",
          "shipped",
          "out_for_delivery",
          "delivered",
        ].includes(order.orderStatus),
      },
      {
        status: "shipped",
        title: "Shipped",
        description: "Your order has been shipped",
        date: order.orderStatus === "shipped" ? order.orderUpdateDate : null,
        completed: ["shipped", "out_for_delivery", "delivered"].includes(
          order.orderStatus
        ),
      },
      {
        status: "out_for_delivery",
        title: "Out for Delivery",
        description: "Your order is out for delivery",
        date:
          order.orderStatus === "out_for_delivery"
            ? order.orderUpdateDate
            : null,
        completed: ["out_for_delivery", "delivered"].includes(
          order.orderStatus
        ),
      },
      {
        status: "delivered",
        title: "Delivered",
        description: "Your order has been delivered",
        date: order.deliveryDate,
        completed: order.orderStatus === "delivered",
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderStatus: order.orderStatus,
        trackingEvents,
        estimatedDelivery: order.estimatedDelivery,
        deliveryDate: order.deliveryDate,
        shippingAddress: order.addressInfo,
      },
    });
  } catch (e) {
    console.error("Track Order Error:", e);
    res.status(500).json({
      success: false,
      message: "Error while tracking order",
      error: e.message,
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  requestCancellation,
  requestReturn,
  trackOrder,
};
