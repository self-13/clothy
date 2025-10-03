const Product = require("../../models/Product");

// ✅ Updated: Get filtered products with new filters
const getFilteredProducts = async (req, res) => {
  try {
    const {
      category = [],
      subcategory = [],
      brand = [],
      color = [],
      sortBy = "most-selling",
      minPrice,
      maxPrice,
      search,
    } = req.query;

    let filters = { isActive: true }; // Only show active products

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (subcategory.length) {
      filters.subcategory = { $in: subcategory.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    if (color.length) {
      filters.colors = { $in: color.split(",") };
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseInt(minPrice);
      if (maxPrice) filters.price.$lte = parseInt(maxPrice);
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
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
        sort.salesCount = -1; // Default to most selling
        break;
    }

    const products = await Product.find(filters).sort(sort).select("+sizes");

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// ✅ Updated: Get product details
const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select("+sizes");

    if (!product || !product.isActive)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// ✅ New: Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .sort({ salesCount: -1 })
      .limit(10)
      .select("+sizes");

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// ✅ New: Get product filters (categories, brands, colors, etc.)
const getProductFilters = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    const subcategories = await Product.distinct("subcategory", {
      isActive: true,
    });
    const brands = await Product.distinct("brand", { isActive: true });
    const colors = await Product.distinct("colors", { isActive: true });

    // Get price range
    const priceRange = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories,
        subcategories,
        brands,
        colors: [...new Set(colors.flat())], // Remove duplicates
        priceRange:
          priceRange.length > 0 ? priceRange[0] : { minPrice: 0, maxPrice: 0 },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// ✅ New: Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { subcategory } = req.query;

    let filters = {
      category,
      isActive: true,
    };

    if (subcategory) {
      filters.subcategory = subcategory;
    }

    const products = await Product.find(filters)
      .sort({ salesCount: -1 })
      .select("+sizes");

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

module.exports = {
  getFilteredProducts,
  getProductDetails,
  getFeaturedProducts,
  getProductFilters,
  getProductsByCategory,
};
