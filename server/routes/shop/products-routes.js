const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
  getFeaturedProducts,
  getProductFilters,
  getProductsByCategory,
  getProductsByTag,
  getNewArrivals,
  getBestSellers,
  getProductsOnSale,
  checkProductStock,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

// Product listing and filtering routes
router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);
router.get("/featured", getFeaturedProducts);
router.get("/filters", getProductFilters);
router.get("/category/:category", getProductsByCategory);
router.get("/tag/:tag", getProductsByTag);
router.get("/new-arrivals", getNewArrivals);
router.get("/best-sellers", getBestSellers);
router.get("/on-sale", getProductsOnSale);

// Product utility routes
router.post("/check-stock", checkProductStock);

module.exports = router;
