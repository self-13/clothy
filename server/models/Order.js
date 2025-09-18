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
      selectedSize: String, // Add selected size to order items
    },
  ],
  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  cashHandlingFee: { type: Number, default: 0 },
  orderDate: Date,
  orderUpdateDate: Date,
  paymentId: String,
  razorpayOrderId: String,
});

module.exports = mongoose.model("Order", OrderSchema);
