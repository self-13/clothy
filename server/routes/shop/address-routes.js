const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const {
  addAddress,
  fetchAllAddress,
  editAddress,
  deleteAddress,
} = require("../../controllers/shop/address-controller");

const router = express.Router();

router.post("/add", authMiddleware, addAddress);
router.get("/get", authMiddleware, fetchAllAddress);
router.delete("/delete/:addressId", authMiddleware, deleteAddress);
router.put("/update/:addressId", authMiddleware, editAddress);

module.exports = router;
