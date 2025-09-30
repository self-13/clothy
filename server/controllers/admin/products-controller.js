const { imageUploadUtil } = require("../../helpers/imagekit");
const Product = require("../../models/Product");
const User = require("../../models/User");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === "admin";
  } catch (error) {
    console.log("Role check error:", error);
    return false;
  }
};

const handleImageUpload = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

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

// Add a new product - FIXED
const addProduct = async (req, res) => {
  try {
    // FIX: Get user ID from header
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

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
      salesCount = 0,
    } = req.body;

    console.log("Creating product with data:", {
      title,
      category,
      brand,
      price,
      sizes,
    });

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
      salesCount,
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
      message: "Product added successfully",
    });
  } catch (e) {
    console.log("Error in addProduct:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while adding product",
      error: e.message,
    });
  }
};

// Fetch all products (admin version) - FIXED
const fetchAllProducts = async (req, res) => {
  try {
    // FIX: Get user ID from header
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const listOfProducts = await Product.find({}).select("+sizes");
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log("Error in fetchAllProducts:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
    });
  }
};

// Edit a product - FIXED
const editProduct = async (req, res) => {
  try {
    // FIX: Get user ID from header
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

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
      salesCount,
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
      salesCount !== undefined ? salesCount : findProduct.salesCount;

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
      message: "Product updated successfully",
    });
  } catch (e) {
    console.log("Error in editProduct:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating product",
    });
  }
};

// Delete a product - FIXED
const deleteProduct = async (req, res) => {
  try {
    // FIX: Get user ID from header
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

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
    console.log("Error in deleteProduct:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting product",
    });
  }
};

// Add size and stock to a product - FIXED
const addSizeToProduct = async (req, res) => {
  try {
    // FIX: Get user ID from header
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { id } = req.params;
    const { size, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingSize = product.sizes.find((s) => s.size === size);
    if (existingSize) {
      return res.status(400).json({
        success: false,
        message: "Size already exists for this product",
      });
    }

    product.sizes.push({ size, stock });

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
    console.log("Error in addSizeToProduct:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while adding size",
    });
  }
};

// Update stock for a specific size - FIXED
const updateSizeStock = async (req, res) => {
  try {
    // FIX: Get user ID from header
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { id, sizeId } = req.params;
    const { stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const sizeItem = product.sizes.id(sizeId);
    if (!sizeItem) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    sizeItem.stock = stock;

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
    console.log("Error in updateSizeStock:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating size stock",
    });
  }
};

// Remove a size from a product - FIXED
const removeSizeFromProduct = async (req, res) => {
  try {
    // FIX: Get user ID from header
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { id, sizeId } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.sizes.pull({ _id: sizeId });

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
    console.log("Error in removeSizeFromProduct:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while removing size",
    });
  }
};

// Increment sales count for a product - FIXED
const incrementSalesCount = async (req, res) => {
  try {
    // FIX: Get user ID from header
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

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
    console.log("Error in incrementSalesCount:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while incrementing sales count",
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
  incrementSalesCount,
};
