const express = require("express");

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
router.post("/create", createOrder);
router.post("/capture", capturePayment);

// Order management routes
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);
router.get("/track/:orderId", trackOrder);

// Cancellation and return routes
router.post("/:orderId/cancel", requestCancellation);
router.post("/:orderId/return", requestReturn);

module.exports = router;
