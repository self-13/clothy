const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const {
  addToWishlist,
  fetchWishlistItems,
  removeFromWishlist,
  checkProductInWishlist,
} = require("../../controllers/shop/wishlist-controller");

const router = express.Router();

router.post("/add", authMiddleware, addToWishlist);
router.get("/get", authMiddleware, fetchWishlistItems);
router.delete("/remove/:productId", authMiddleware, removeFromWishlist);
router.get("/check/:productId", authMiddleware, checkProductInWishlist);

module.exports = router;
