const { paypal, client } = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

    // Create PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: totalAmount.toFixed(2),
              },
            },
          },
          items: cartItems.map((item) => ({
            name: item.title,
            unit_amount: {
              currency_code: "USD",
              value: item.price.toFixed(2),
            },
            quantity: item.quantity.toString(),
            category: "PHYSICAL_GOODS",
          })),
          shipping: {
            address: {
              address_line_1: addressInfo.address,
              admin_area_2: addressInfo.city,
              admin_area_1: addressInfo.state,
              postal_code: addressInfo.postalCode || addressInfo.pincode,
              country_code: addressInfo.country || "US", 
            },
          },
        },
      ],
      application_context: {
        return_url: "http://localhost:5173/shop/paypal-return",
        cancel_url: "http://localhost:5173/shop/paypal-cancel",
        shipping_preference: "SET_PROVIDED_ADDRESS",
      },
    });

    // Execute the request
    const orderResponse = await client.execute(request);

    // Save order in DB
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: orderStatus || "pending",
      paymentMethod: paymentMethod || "paypal",
      paymentStatus: paymentStatus || "pending",
      totalAmount,
      orderDate: orderDate || new Date(),
      orderUpdateDate: orderUpdateDate || new Date(),
      paymentId: orderResponse.result.id,
    });

    await newlyCreatedOrder.save();

    // Find approval link
    const approvalLink = orderResponse.result.links.find(
      (link) => link.rel === "approve"
    );

    if (!approvalLink) {
      return res.status(500).json({
        success: false,
        message: "No approval URL found in PayPal response",
      });
    }

    res.status(201).json({
      success: true,
      approvalURL: approvalLink.href,
      orderId: newlyCreatedOrder._id,
      paypalOrderId: orderResponse.result.id,
    });
  } catch (e) {
    console.error("PayPal Order Creation Error:", e);
    res.status(500).json({
      success: false,
      message: "Error while creating PayPal order",
      error: e.message,
    });
  }
};

// ✅ Capture PayPal order - UPDATED
const capturePayment = async (req, res) => {
  try {
    const { orderId, dbOrderId } = req.body; // PayPal orderId + MongoDB orderId

    // Create capture request
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const captureResponse = await client.execute(request);

    let order = await Order.findById(dbOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order cannot be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = orderId;
    order.payerId = captureResponse.result.payer?.payer_id || null;
    order.orderUpdateDate = new Date();

    // Update stock
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

    // Delete cart
    if (order.cartId) {
      await Cart.findByIdAndDelete(order.cartId);
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
      paypalCapture: captureResponse.result,
    });
  } catch (e) {
    console.error("PayPal Capture Error:", e);
    res.status(500).json({
      success: false,
      message: "Error while capturing PayPal order",
      error: e.message,
    });
  }
};

// ✅ Get all orders by user (unchanged)
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

// ✅ Get single order details (unchanged)
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