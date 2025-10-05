const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  selectedSize: {
    type: String,
    required: true,
  },
  selectedColor: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
  },
});

const AddressSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
  pincode: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  type: {
    type: String,
    enum: ["home", "work", "other"],
    default: "home",
  },
});

const CancellationSchema = new mongoose.Schema({
  requested: {
    type: Boolean,
    default: false,
  },
  requestedAt: Date,
  reason: String,
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  processedAt: Date,
  processedBy: String,
  refundAmount: Number,
  refundId: String,
  adminNotes: String,
});

const ReturnSchema = new mongoose.Schema({
  requested: {
    type: Boolean,
    default: false,
  },
  requestedAt: Date,
  reason: String,
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  processedAt: Date,
  processedBy: String,
  refundAmount: Number,
  refundId: String,
  pickupAddress: AddressSchema,
  adminNotes: String,
  returnReason: {
    type: String,
    enum: [
      "wrong-size",
      "wrong-color",
      "defective",
      "not-as-described",
      "changed-mind",
      "other",
    ],
  },
});

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartId: String,
    items: [OrderItemSchema],
    addressInfo: AddressSchema,
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
    paymentMethod: {
      type: String,
      enum: ["cod", "online", "wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    cashHandlingFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    orderUpdateDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: Date,
    estimatedDelivery: Date,
    paymentId: String,
    razorpayOrderId: String,

    // Cancellation fields
    cancellation: CancellationSchema,

    // Return fields
    return: ReturnSchema,

    // Tracking information
    tracking: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
OrderSchema.index({ userId: 1, orderDate: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ "cancellation.requested": 1 });
OrderSchema.index({ "return.requested": 1 });
OrderSchema.index({ razorpayOrderId: 1 });

// Virtual for order summary
OrderSchema.virtual("orderSummary").get(function () {
  const subtotal = this.items.reduce((sum, item) => {
    return sum + (item.salePrice || item.price) * item.quantity;
  }, 0);

  return {
    subtotal,
    shipping: this.shippingFee,
    handling: this.cashHandlingFee,
    discount: this.discount,
    total: this.totalAmount,
  };
});

// Virtual for isCancellable
OrderSchema.virtual("isCancellable").get(function () {
  return ["confirmed", "processing"].includes(this.orderStatus);
});

// Virtual for isReturnable
OrderSchema.virtual("isReturnable").get(function () {
  if (this.orderStatus !== "delivered") return false;
  const deliveryDate = this.deliveryDate || this.orderUpdateDate;
  const returnDeadline = new Date(deliveryDate);
  returnDeadline.setDate(returnDeadline.getDate() + 7);
  return new Date() <= returnDeadline;
});

// Pre-save middleware to update orderUpdateDate
OrderSchema.pre("save", function (next) {
  this.orderUpdateDate = new Date();
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
