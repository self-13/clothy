const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
  requestCancellation,
  requestReturn,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/capture", capturePayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);
router.post("/:orderId/cancel", requestCancellation);
router.post("/:orderId/return", requestReturn);

module.exports = router;
