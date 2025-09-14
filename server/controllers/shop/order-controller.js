const razorpay = require("../../helpers/razorpay");
const crypto = require("crypto");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// ✅ Create Razorpay Order (only in Razorpay, not in our DB yet)
const createOrder = async (req, res) => {
  try {
    const { totalAmount, ...orderData } = req.body;

    // Create Razorpay order
    const options = {
      amount: Math.round(totalAmount * 100), // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save order in DB with "pending" status
    const newOrder = new Order({
      ...orderData,
      totalAmount,
      orderStatus: "pending",
      paymentStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: newOrder._id, // return DB orderId
    });
  } catch (e) {
    console.error("Razorpay Order Creation Error:", e);
    res.status(500).json({
      success: false,
      message: "Error while creating Razorpay order",
      error: e.message,
    });
  }
};

// ✅ Verify and Capture Payment - Only update order after successful payment
const capturePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    // Verify signature first
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature. Payment verification failed.",
      });
    }

    // Fetch order from DB
    const order = await Order.findById(dbOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Update stock for each product
    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.title} not found`,
        });
      }

      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product ${item.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    // Delete cart after order confirmed
    if (order.cartId) {
      await Cart.findByIdAndDelete(order.cartId);
    }

    // Update order with payment info
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = razorpay_payment_id;
    order.razorpayOrderId = razorpay_order_id;
    order.orderUpdateDate = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed & payment verified",
      data: order,
      orderId: order._id,
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

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
