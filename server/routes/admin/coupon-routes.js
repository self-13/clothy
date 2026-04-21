const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../../controllers/admin/coupon-controller");

const router = express.Router();

router.post("/add", createCoupon);
router.get("/get", getAllCoupons);
router.put("/update/:id", updateCoupon);
router.delete("/delete/:id", deleteCoupon);
router.post("/validate", validateCoupon); // This also works for shop side

module.exports = router;
