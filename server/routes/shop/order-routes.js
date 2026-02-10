const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
  requestCancellation,
  requestReturn,
  trackOrder,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

// Order creation and payment routes
router.post("/create", authMiddleware, createOrder);
router.post("/capture", authMiddleware, capturePayment);

// Order management routes
router.get("/list", authMiddleware, getAllOrdersByUser);
router.get("/details/:id", authMiddleware, getOrderDetails);
router.get("/track/:orderId", authMiddleware, trackOrder);

// Cancellation and return routes
router.post("/:orderId/cancel", authMiddleware, requestCancellation);
router.post("/:orderId/return", authMiddleware, requestReturn);

module.exports = router;
