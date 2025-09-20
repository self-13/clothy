const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controllers/shop/cart-controller");

const router = express.Router();

router.post("/add", addToCart);
router.get("/get/:userId", fetchCartItems);
router.put("/update", updateCartItemQty); // Changed from "/update-cart" to "/update"
router.delete("/delete/:userId/:productId/:selectedSize", deleteCartItem); // Added selectedSize parameter

module.exports = router;
