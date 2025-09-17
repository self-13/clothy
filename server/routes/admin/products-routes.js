const express = require("express");
const {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
  addSizeToProduct,
  updateSizeStock,
  removeSizeFromProduct,
} = require("../../controllers/admin/products-controller");

const { upload } = require("../../helpers/imagekit"); // <- bring this back

const router = express.Router();

router.post("/image-upload", upload.single("my_file"), handleImageUpload);
router.post("/add", addProduct);
router.get("/fetch-all", fetchAllProducts);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);

// New routes for size management
router.post("/:id/sizes", addSizeToProduct);
router.put("/:id/sizes/:sizeId", updateSizeStock);
router.delete("/:id/sizes/:sizeId", removeSizeFromProduct);

module.exports = router;
