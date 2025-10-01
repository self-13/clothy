const razorpay = require("../../helpers/razorpay");
const crypto = require("crypto");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const {
  sendOrderConfirmationEmail,
  sendNewOrderNotificationEmail,
  sendCancellationRequestEmail, // ✅ Added missing imports
  sendReturnRequestEmail, // ✅ Added missing imports
} = require("../../helpers/emailService");
const User = require("../../models/User");

// ✅ Create Order
const createOrder = async (req, res) => {
  try {
    const { totalAmount, paymentMethod, ...orderData } = req.body;

    // Calculate cash handling fee if COD is selected
    let finalAmount = totalAmount;
    let cashHandlingFee = 0;

    if (paymentMethod === "cod") {
      cashHandlingFee = 60;
      finalAmount = totalAmount + cashHandlingFee;

      // For COD, create the order directly in DB with confirmed status
      const newOrder = new Order({
        ...orderData,
        totalAmount: finalAmount,
        cashHandlingFee: cashHandlingFee,
        paymentMethod,
        orderStatus: "confirmed",
        paymentStatus: "cod",
        orderDate: new Date(),
        orderUpdateDate: new Date(),
        deliveryDate: null, // ✅ Initialize delivery date as null
      });

      await newOrder.save();

      // Update stock for each product and size for COD orders
      for (let item of newOrder.cartItems) {
        let product = await Product.findById(item.productId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.title} not found`,
          });
        }

        // Find the specific size and update stock
        const sizeItem = product.sizes.find(
          (s) => s.size === item.selectedSize
        );
        if (!sizeItem) {
          return res.status(400).json({
            success: false,
            message: `Size ${item.selectedSize} not available for product ${item.title}`,
          });
        }

        if (sizeItem.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for size ${item.selectedSize} of product ${item.title}`,
          });
        }

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
            addressInfo: newOrder.addressInfo,
          });
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the order if email fails
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
          addressInfo: newOrder.addressInfo,
        });
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
        // Don't fail the order if email fails
      }

      return res.status(201).json({
        success: true,
        orderId: newOrder._id,
        paymentMethod,
        message: "COD order created successfully",
      });
    } else {
      // For online payments, create Razorpay order only
      const options = {
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      return res.status(201).json({
        success: true,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentMethod,
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

// ✅ Verify and Capture Payment - Only for online payments
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

    // Calculate final amount
    let finalAmount = orderData.totalAmount;
    let cashHandlingFee = 0;

    if (orderData.paymentMethod === "cod") {
      cashHandlingFee = 60;
      finalAmount = orderData.totalAmount + cashHandlingFee;
    }

    console.log("Creating order with final amount:", finalAmount);

    // Create the order in DB only after successful payment verification
    const newOrder = new Order({
      userId: orderData.userId,
      cartId: orderData.cartId,
      cartItems: orderData.cartItems,
      addressInfo: orderData.addressInfo,
      totalAmount: finalAmount,
      cashHandlingFee: cashHandlingFee,
      paymentMethod: orderData.paymentMethod,
      orderStatus: "confirmed",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      deliveryDate: null, // ✅ Initialize delivery date as null
    });

    await newOrder.save();
    console.log("Order saved to database:", newOrder._id);

    // Update stock for each product and size
    for (let item of newOrder.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        console.log(`Product not found: ${item.productId}`);
        return res.status(404).json({
          success: false,
          message: `Product ${item.title} not found`,
        });
      }

      // Find the specific size and update stock
      const sizeItem = product.sizes.find((s) => s.size === item.selectedSize);
      if (!sizeItem) {
        console.log(
          `Size not found: ${item.selectedSize} for product ${item.title}`
        );
        return res.status(400).json({
          success: false,
          message: `Size ${item.selectedSize} not available for product ${item.title}`,
        });
      }

      if (sizeItem.stock < item.quantity) {
        console.log(
          `Not enough stock for size ${item.selectedSize} of product ${item.title}`
        );
        return res.status(400).json({
          success: false,
          message: `Not enough stock for size ${item.selectedSize} of product ${item.title}`,
        });
      }

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
          addressInfo: newOrder.addressInfo,
        });
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the order if email fails
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
        addressInfo: newOrder.addressInfo,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
      // Don't fail the order if email fails
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

// ✅ Get all orders by user
const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.error("Get Orders Error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// ✅ Get single order details
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

    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.error("Get Order Details Error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// ✅ Request Order Cancellation
const requestCancellation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

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

    // Check if order can be cancelled (only confirmed/processing orders)
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
        addressInfo: order.addressInfo,
      });
    } catch (emailError) {
      console.error("Failed to send cancellation request email:", emailError);
      // Don't fail the request if email fails
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

// ✅ Request Order Return
const requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

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

    // ✅ Use deliveryDate if available, otherwise use orderUpdateDate
    const deliveryDate = order.deliveryDate || order.orderUpdateDate;
    const returnDeadline = new Date(
      deliveryDate.setDate(deliveryDate.getDate() + 7)
    );

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
        addressInfo: order.addressInfo,
      });
    } catch (emailError) {
      console.error("Failed to send return request email:", emailError);
      // Don't fail the request if email fails
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

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  requestCancellation,
  requestReturn,
};
