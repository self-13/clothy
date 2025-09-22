const { imageUploadUtil } = require("../../helpers/imagekit");
const Product = require("../../models/Product");
const User = require("../../models/User"); // Import User model

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
    // Check admin role
    const isAdmin = await checkAdminRole(req.user.id);
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

// Add a new product
const addProduct = async (req, res) => {
  try {
    // Check admin role
    const isAdmin = await checkAdminRole(req.user.id);
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
      salesCount,
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

// Fetch all products (admin version)
const fetchAllProducts = async (req, res) => {
  try {
    // Check admin role
    const isAdmin = await checkAdminRole(req.user.id);
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
    // Check admin role
    const isAdmin = await checkAdminRole(req.user.id);
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
    // Check admin role
    const isAdmin = await checkAdminRole(req.user.id);
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
    // Check admin role
    const isAdmin = await checkAdminRole(req.user.id);
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
    // Check admin role
    const isAdmin = await checkAdminRole(req.user.id);
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
    // Check admin role
    const isAdmin = await checkAdminRole(req.user.id);
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
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Increment sales count for a product
const incrementSalesCount = async (req, res) => {
  try {
    // Check admin role
    const isAdmin = await checkAdminRole(req.user.id);
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
  incrementSalesCount,
};
