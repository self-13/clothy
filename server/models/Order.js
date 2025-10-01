const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: String,
      quantity: Number,
      selectedSize: String,
    },
  ],
  addressInfo: {
    name: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  orderStatus: {
    type: String,
    enum: [
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned",
    ],
    default: "confirmed",
  },
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  cashHandlingFee: { type: Number, default: 0 },
  orderDate: Date,
  orderUpdateDate: Date,
  deliveryDate: Date, // ✅ Added delivery date field
  paymentId: String,
  razorpayOrderId: String,

  // Cancellation fields
  cancellation: {
    requested: { type: Boolean, default: false },
    requestedAt: Date,
    reason: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    processedAt: Date,
    processedBy: String,
    refundAmount: Number,
    refundId: String,
  },

  // Return fields
  return: {
    requested: { type: Boolean, default: false },
    requestedAt: Date,
    reason: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    processedAt: Date,
    processedBy: String,
    refundAmount: Number,
    refundId: String,
    pickupAddress: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
});

module.exports = mongoose.model("Order", OrderSchema);
