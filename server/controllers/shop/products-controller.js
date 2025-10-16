const Product = require("../../models/Product");

// ✅ Updated: Get filtered products with all new fields and filters
const getFilteredProducts = async (req, res) => {
  try {
    const {
      category = [],
      subcategory = [],
      brand = [],
      color = [],
      size = [],
      sortBy = "most-selling",
      minPrice,
      maxPrice,
      search,
      isFeatured,
      tags,
      minRating,
      maxRating,
      inStock,
      page = 1,
      limit = 100,
    } = req.query;

    let filters = { isActive: true }; // Only show active products

    // Category filter
    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    // Subcategory filter
    if (subcategory.length) {
      filters.subcategory = { $in: subcategory.split(",") };
    }

    // Brand filter
    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    // Color filter
    if (color.length) {
      filters.colors = { $in: color.split(",") };
    }

    // Size filter - check if any product has the specified size with stock > 0
    if (size.length) {
      const sizeArray = size.split(",");
      filters["sizes.size"] = { $in: sizeArray };
      if (inStock === "true") {
        filters["sizes.stock"] = { $gt: 0 };
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseInt(minPrice);
      if (maxPrice) filters.price.$lte = parseInt(maxPrice);
    }

    // Rating filter
    if (minRating || maxRating) {
      filters.averageReview = {};
      if (minRating) filters.averageReview.$gte = parseFloat(minRating);
      if (maxRating) filters.averageReview.$lte = parseFloat(maxRating);
    }

    // Featured products filter
    if (isFeatured !== undefined) {
      filters.isFeatured = isFeatured === "true";
    }

    // Tags filter
    if (tags) {
      filters.tags = { $in: tags.split(",") };
    }

    // Stock availability filter
    if (inStock === "true") {
      filters.totalStock = { $gt: 0 };
    } else if (inStock === "false") {
      filters.totalStock = { $lte: 0 };
    }

    // Search filter
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    let sort = {};
    const sortOptions = {
      "price-lowtohigh": { price: 1 },
      "price-hightolow": { price: -1 },
      "title-atoz": { title: 1 },
      "title-ztoa": { title: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "most-selling": { salesCount: -1 },
      "highest-rated": { averageReview: -1 },
      featured: { isFeatured: -1, salesCount: -1 },
    };

    sort = sortOptions[sortBy] || { salesCount: -1 };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products with pagination
    const products = await Product.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("+sizes");

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.log("Error in getFilteredProducts:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching products",
    });
  }
};

// ✅ Updated: Get product details with all fields
const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select("+sizes");

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    // Get related products (same category or subcategory)
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      $or: [
        { category: product.category },
        { subcategory: product.subcategory },
      ],
      isActive: true,
    })
      .limit(4)
      .select("title images price salePrice averageReview salesCount");

    res.status(200).json({
      success: true,
      data: {
        product,
        relatedProducts,
      },
    });
  } catch (error) {
    console.log("Error in getProductDetails:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching product details",
    });
  }
};

// ✅ Updated: Get featured products with all fields
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .sort({ salesCount: -1, averageReview: -1 })
      .limit(parseInt(limit))
      .select("+sizes");

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log("Error in getFeaturedProducts:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching featured products",
    });
  }
};

// ✅ Updated: Get product filters with all available options
const getProductFilters = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    const subcategories = await Product.distinct("subcategory", {
      isActive: true,
    });
    const brands = await Product.distinct("brand", { isActive: true });
    const colors = await Product.distinct("colors", { isActive: true });
    const tags = await Product.distinct("tags", { isActive: true });

    // Get all available sizes from products
    const productsWithSizes = await Product.find(
      { isActive: true, "sizes.stock": { $gt: 0 } },
      { sizes: 1 }
    );

    const availableSizes = [
      ...new Set(
        productsWithSizes.flatMap((product) =>
          product.sizes
            .filter((size) => size.stock > 0)
            .map((size) => size.size)
        )
      ),
    ].sort();

    // Get price range
    const priceRange = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          minSalePrice: { $min: "$salePrice" },
          maxSalePrice: { $max: "$salePrice" },
        },
      },
    ]);

    // Get rating statistics
    const ratingStats = await Product.aggregate([
      { $match: { isActive: true, averageReview: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          minRating: { $min: "$averageReview" },
          maxRating: { $max: "$averageReview" },
          avgRating: { $avg: "$averageReview" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories: categories.filter(Boolean).sort(),
        subcategories: subcategories.filter(Boolean).sort(),
        brands: brands.filter(Boolean).sort(),
        colors: [...new Set(colors.flat())].sort(), // Remove duplicates and sort
        sizes: availableSizes,
        tags: tags.filter(Boolean).sort(),
        priceRange:
          priceRange.length > 0
            ? {
                minPrice: priceRange[0].minPrice || 0,
                maxPrice: priceRange[0].maxPrice || 0,
                minSalePrice: priceRange[0].minSalePrice || 0,
                maxSalePrice: priceRange[0].maxSalePrice || 0,
              }
            : { minPrice: 0, maxPrice: 0, minSalePrice: 0, maxSalePrice: 0 },
        ratingRange:
          ratingStats.length > 0
            ? {
                minRating: ratingStats[0].minRating || 0,
                maxRating: ratingStats[0].maxRating || 5,
                avgRating: ratingStats[0].avgRating || 0,
              }
            : { minRating: 0, maxRating: 5, avgRating: 0 },
      },
    });
  } catch (error) {
    console.log("Error in getProductFilters:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching product filters",
    });
  }
};

// ✅ Updated: Get products by category with all fields
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const {
      subcategory,
      brand,
      color,
      size,
      sortBy = "most-selling",
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
    } = req.query;

    let filters = {
      category: category.toLowerCase(),
      isActive: true,
    };

    // Additional filters
    if (subcategory) {
      filters.subcategory = subcategory;
    }

    if (brand) {
      filters.brand = { $in: brand.split(",") };
    }

    if (color) {
      filters.colors = { $in: color.split(",") };
    }

    if (size) {
      filters["sizes.size"] = { $in: size.split(",") };
      filters["sizes.stock"] = { $gt: 0 };
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseInt(minPrice);
      if (maxPrice) filters.price.$lte = parseInt(maxPrice);
    }

    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      case "newest":
        sort.createdAt = -1;
        break;
      case "most-selling":
        sort.salesCount = -1;
        break;
      case "highest-rated":
        sort.averageReview = -1;
        break;
      default:
        sort.salesCount = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("+sizes");

    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    // Get category statistics
    const categoryStats = await Product.aggregate([
      { $match: { category: category.toLowerCase(), isActive: true } },
      {
        $group: {
          _id: "$subcategory",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: products,
      category: category,
      subcategories: categoryStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.log("Error in getProductsByCategory:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching category products",
    });
  }
};

// ✅ New: Get products by tags
const getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const filters = {
      tags: { $in: [tag] },
      isActive: true,
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filters)
      .sort({ salesCount: -1, averageReview: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("+sizes");

    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.status(200).json({
      success: true,
      data: products,
      tag: tag,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.log("Error in getProductsByTag:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching tagged products",
    });
  }
};

// ✅ New: Get new arrivals
const getNewArrivals = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const products = await Product.find({
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select("+sizes");

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log("Error in getNewArrivals:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching new arrivals",
    });
  }
};

// ✅ New: Get best selling products
const getBestSellers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({
      isActive: true,
      salesCount: { $gt: 0 },
    })
      .sort({ salesCount: -1, averageReview: -1 })
      .limit(parseInt(limit))
      .select("+sizes");

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log("Error in getBestSellers:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching best sellers",
    });
  }
};

// ✅ New: Get products on sale
const getProductsOnSale = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({
      isActive: true,
      salePrice: { $exists: true, $ne: null, $lt: "$price" },
    })
      .sort({ salesCount: -1 })
      .limit(parseInt(limit))
      .select("+sizes");

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log("Error in getProductsOnSale:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching products on sale",
    });
  }
};

// ✅ New: Check product stock availability
const checkProductStock = async (req, res) => {
  try {
    const { productId, size, quantity = 1 } = req.body;

    if (!productId || !size) {
      return res.status(400).json({
        success: false,
        message: "Product ID and size are required",
      });
    }

    const product = await Product.findById(productId).select("+sizes");

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const sizeItem = product.sizes.find((s) => s.size === size);
    const availableStock = sizeItem ? sizeItem.stock : 0;
    const isAvailable = availableStock >= quantity;

    res.status(200).json({
      success: true,
      data: {
        productId,
        size,
        requestedQuantity: quantity,
        availableStock,
        isAvailable,
        canFulfill: isAvailable,
        message: isAvailable
          ? `Product available in stock`
          : `Only ${availableStock} items available in size ${size}`,
      },
    });
  } catch (error) {
    console.log("Error in checkProductStock:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while checking product stock",
    });
  }
};

module.exports = {
  getFilteredProducts,
  getProductDetails,
  getFeaturedProducts,
  getProductFilters,
  getProductsByCategory,
  getProductsByTag,
  getNewArrivals,
  getBestSellers,
  getProductsOnSale,
  checkProductStock,
};
