const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
  clearCart,
} = require("../../controllers/shop/cart-controller");

const router = express.Router();

// Cart item management routes
router.post("/add", addToCart);
router.get("/get/:userId", fetchCartItems);
router.put("/update", updateCartItemQty);
router.delete(
  "/delete/:userId/:productId/:selectedSize/:selectedColor",
  deleteCartItem
);
router.delete("/clear/:userId", clearCart);

module.exports = router;
