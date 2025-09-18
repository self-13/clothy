const razorpay = require("../../helpers/razorpay");
const crypto = require("crypto");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

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

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
