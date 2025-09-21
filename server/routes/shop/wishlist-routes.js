const express = require("express");
const {
  addToWishlist,
  fetchWishlistItems,
  removeFromWishlist,
  checkProductInWishlist,
} = require("../../controllers/shop/wishlist-controller");

const router = express.Router();

router.post("/add", addToWishlist);
router.get("/get/:userId", fetchWishlistItems);
router.delete("/remove/:userId/:productId", removeFromWishlist);
router.get("/check/:userId/:productId", checkProductInWishlist);

module.exports = router;
