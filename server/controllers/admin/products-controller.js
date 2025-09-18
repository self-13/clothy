const { imageUploadUtil } = require("../../helpers/imagekit");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await imageUploadUtil(
      req.file.buffer,
      req.file.originalname
    );

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log("Image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred during image upload",
      error: error.message,
    });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      sizes,
      salesCount = 0, // Add salesCount with default value
    } = req.body;

    console.log(averageReview, "averageReview");

    const newlyCreatedProduct = new Product({
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      sizes: sizes || [],
      salesCount, // Include salesCount
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({}).select("+sizes"); // Ensure sizes are included
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      sizes,
      salesCount, // Add salesCount
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === "" ? 0 : price || findProduct.price;
    findProduct.salePrice =
      salePrice === "" ? 0 : salePrice || findProduct.salePrice;
    findProduct.totalStock = totalStock || findProduct.totalStock;
    findProduct.image = image || findProduct.image;
    findProduct.averageReview = averageReview || findProduct.averageReview;
    findProduct.sizes = sizes || findProduct.sizes;
    findProduct.salesCount =
      salesCount !== undefined ? salesCount : findProduct.salesCount; // Update salesCount

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Add size and stock to a product
const addSizeToProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if size already exists
    const existingSize = product.sizes.find((s) => s.size === size);
    if (existingSize) {
      return res.status(400).json({
        success: false,
        message: "Size already exists for this product",
      });
    }

    // Add new size
    product.sizes.push({ size, stock });

    // Recalculate total stock from sizes
    const totalStockFromSizes = product.sizes.reduce(
      (total, item) => total + (item.stock || 0),
      0
    );
    product.totalStock = totalStockFromSizes;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Update stock for a specific size
const updateSizeStock = async (req, res) => {
  try {
    const { id, sizeId } = req.params;
    const { stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find the size and update stock
    const sizeItem = product.sizes.id(sizeId);
    if (!sizeItem) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    sizeItem.stock = stock;

    // Recalculate total stock from sizes
    const totalStockFromSizes = product.sizes.reduce(
      (total, item) => total + (item.stock || 0),
      0
    );
    product.totalStock = totalStockFromSizes;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Remove a size from a product
const removeSizeFromProduct = async (req, res) => {
  try {
    const { id, sizeId } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Remove the size
    product.sizes.pull({ _id: sizeId });

    // Recalculate total stock from sizes
    const totalStockFromSizes = product.sizes.reduce(
      (total, item) => total + (item.stock || 0),
      0
    );
    product.totalStock = totalStockFromSizes;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Increment sales count for a product (to be called when orders are placed)
const incrementSalesCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.salesCount += quantity;
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
  addSizeToProduct,
  updateSizeStock,
  removeSizeFromProduct,
  incrementSalesCount, // Export the new function
};
