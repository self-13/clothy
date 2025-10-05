const express = require("express");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  getCancellationRequests,
  getReturnRequests,
  updateCancellationStatus,
  updateReturnStatus,
  getAllPendingRequests,
  getOrderAnalytics,
} = require("../../controllers/admin/order-controller");

const router = express.Router();

// Order management routes
router.get("/get", getAllOrdersOfAllUsers);
router.get("/details/:id", getOrderDetailsForAdmin);
router.put("/update/:id", updateOrderStatus);

// Cancellation and return management routes
router.get("/cancellation-requests", getCancellationRequests);
router.get("/return-requests", getReturnRequests);
router.get("/pending-requests", getAllPendingRequests);
router.put("/:id/cancellation-status", updateCancellationStatus);
router.put("/:id/return-status", updateReturnStatus);

// Analytics and reporting routes
router.get("/analytics", getOrderAnalytics);

module.exports = router;
