const mongoose = require("mongoose");

const SizeStockSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
});

const ProductSchema = new mongoose.Schema(
  {
    // ✅ Multiple images - first image is main image
    images: [
      {
        type: String,
        required: true,
      },
    ],
    title: {
      type: String,
      required: true,
    },
    description: String,

    // ✅ Gender category (man, woman)
    category: {
      type: String,
      required: true,
    },

    // ✅ Subcategory (t-shirt, lower, oversized, shoes, others)
    subcategory: {
      type: String,
      required: true,
    },

    brand: String,
    price: {
      type: Number,
      required: true,
    },
    salePrice: Number,

    // ✅ Color selection
    colors: [
      {
        type: String,
        required: true,
      },
    ],

    totalStock: Number,
    averageReview: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    sizes: [SizeStockSchema], // Array of size and stock objects
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ✅ Additional fields for better filtering
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String], // For additional categorization
  },
  { timestamps: true }
);

// ✅ Virtual for main image (first image in array)
ProductSchema.virtual("mainImage").get(function () {
  return this.images.length > 0 ? this.images[0] : null;
});

module.exports = mongoose.model("Product", ProductSchema);
