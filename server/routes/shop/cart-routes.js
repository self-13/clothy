const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
  clearCart,
} = require("../../controllers/shop/cart-controller");

const router = express.Router();

// Cart item management routes
router.post("/add", authMiddleware, addToCart);
router.get("/get", authMiddleware, fetchCartItems);
router.put("/update", authMiddleware, updateCartItemQty);
router.delete(
  "/delete/:productId/:selectedSize/:selectedColor",
  authMiddleware,
  deleteCartItem
);
router.delete("/clear", authMiddleware, clearCart);

module.exports = router;
