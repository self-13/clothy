const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10, // Maximum quantity per item
  },
  selectedSize: {
    type: String,
    required: true,
  },
  selectedColor: {
    type: String,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  {
    timestamps: true,
  }
);

// Index for better performance
CartSchema.index({ userId: 1 });
CartSchema.index({ "items.productId": 1 });

// Virtual for cart total items count
CartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for cart subtotal
CartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((total, item) => {
    if (item.productId && item.productId.price) {
      const price = item.productId.salePrice || item.productId.price;
      return total + price * item.quantity;
    }
    return total;
  }, 0);
});

module.exports = mongoose.model("Cart", CartSchema);
