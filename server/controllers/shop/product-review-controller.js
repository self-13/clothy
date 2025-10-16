const Order = require("../../models/Order");
const Product = require("../../models/Product");
const ProductReview = require("../../models/Review");
const mongoose = require("mongoose");

const addProductReview = async (req, res) => {
  try {
    const { productId, userId, userName, reviewMessage, reviewValue } =
      req.body;

    console.log("📝 Review request:", {
      productId,
      userId,
      userName,
      reviewMessage,
      reviewValue,
    });

    // Convert productId to ObjectId for proper comparison
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Check if user has purchased the product
    const order = await Order.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      "items.productId": productObjectId,
      orderStatus: {
        $in: [
          "confirmed",
          "processing",
          "shipped",
          "out_for_delivery",
          "delivered",
        ],
      },
    });

    console.log(
      "🔍 Order check result:",
      order ? "Order found" : "No order found"
    );

    if (!order) {
      // Let's debug by checking what orders the user actually has
      const userOrders = await Order.find({
        userId: new mongoose.Types.ObjectId(userId),
      }).select("items.productId orderStatus");

      console.log("📦 User orders:", userOrders);

      return res.status(403).json({
        success: false,
        message: "You need to purchase this product to review it.",
        debug: {
          userId,
          productId,
          userOrders: userOrders.map((order) => ({
            orderId: order._id,
            items: order.items.map((item) => ({
              productId: item.productId,
              productIdString: item.productId.toString(),
            })),
            orderStatus: order.orderStatus,
          })),
        },
      });
    }

    // Check if user already reviewed this product
    const checkExistingReview = await ProductReview.findOne({
      productId,
      userId,
    });

    if (checkExistingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product!",
      });
    }

    // Create new review
    const newReview = new ProductReview({
      productId,
      userId,
      userName,
      reviewMessage,
      reviewValue,
    });

    await newReview.save();

    // Update product average rating
    const reviews = await ProductReview.find({ productId });
    const totalReviewsLength = reviews.length;
    const averageReview =
      totalReviewsLength > 0
        ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
          totalReviewsLength
        : 0;

    await Product.findByIdAndUpdate(productId, {
      averageReview,
      reviewCount: totalReviewsLength,
    });

    res.status(201).json({
      success: true,
      data: newReview,
      message: "Review added successfully!",
    });
  } catch (e) {
    console.log("❌ Error in addProductReview:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message,
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await ProductReview.find({ productId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (e) {
    console.log("❌ Error in getProductReviews:", e);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: e.message,
    });
  }
};

module.exports = { addProductReview, getProductReviews };
