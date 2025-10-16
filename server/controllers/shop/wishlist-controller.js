const Wishlist = require("../../models/Wishlist");
const Product = require("../../models/Product");

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required!",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    // Check if product already exists in wishlist
    const productExists = wishlist.items.some(
      (item) => item.productId.toString() === productId
    );

    if (productExists) {
      return res.status(400).json({
        success: false,
        message: "Product is already in wishlist",
      });
    }

    // Add product to wishlist
    wishlist.items.push({ productId });
    await wishlist.save();

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error adding to wishlist",
    });
  }
};

const fetchWishlistItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required!",
      });
    }

    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: "items.productId",
      select:
        "images title price salePrice category brand averageReview totalStock sizes colors isFeatured tags description subcategory salesCount",
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: { items: [] },
        message: "Wishlist is empty",
      });
    }

    // Filter out any products that might have been deleted
    const validItems = wishlist.items.filter((item) => item.productId);

    if (validItems.length < wishlist.items.length) {
      wishlist.items = validItems;
      await wishlist.save();
    }

    // Format the response to match your product tile requirements
    const populatedWishlistItems = validItems.map((item) => {
      const product = item.productId;
      return {
        _id: product._id,
        productId: product._id,
        images: product.images || [],
        image: product.images?.[0] || null, // Main image for backward compatibility
        title: product.title,
        price: product.price,
        salePrice: product.salePrice,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        averageReview: product.averageReview,
        totalStock: product.totalStock,
        sizes: product.sizes || [],
        colors: product.colors || [],
        isFeatured: product.isFeatured,
        tags: product.tags || [],
        description: product.description,
        salesCount: product.salesCount,
        addedAt: item.addedAt,
        // Add calculated fields for product tile
        hasSale: product.salePrice > 0 && product.salePrice < product.price,
        discountPercentage:
          product.salePrice > 0 && product.salePrice < product.price
            ? Math.round(
                ((product.price - product.salePrice) / product.price) * 100
              )
            : 0,
        isOutOfStock: (product.totalStock || 0) === 0,
        lowStock:
          (product.totalStock || 0) > 0 && (product.totalStock || 0) < 10,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...wishlist._doc,
        items: populatedWishlistItems,
      },
    });
  } catch (error) {
    console.log("❌ Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
      error: error.message,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required!",
      });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found!",
      });
    }

    // Remove the product from wishlist
    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );

    if (wishlist.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist!",
      });
    }

    await wishlist.save();

    // Populate the remaining items for response
    await wishlist.populate({
      path: "items.productId",
      select:
        "images title price salePrice category brand averageReview totalStock sizes colors isFeatured tags description subcategory salesCount",
    });

    const populatedWishlistItems = wishlist.items.map((item) => {
      const product = item.productId;
      if (!product) {
        return {
          productId: null,
          title: "Product not found",
          addedAt: item.addedAt,
        };
      }

      return {
        _id: product._id,
        productId: product._id,
        images: product.images || [],
        image: product.images?.[0] || null,
        title: product.title,
        price: product.price,
        salePrice: product.salePrice,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        averageReview: product.averageReview,
        totalStock: product.totalStock,
        sizes: product.sizes || [],
        colors: product.colors || [],
        isFeatured: product.isFeatured,
        tags: product.tags || [],
        description: product.description,
        salesCount: product.salesCount,
        addedAt: item.addedAt,
        hasSale: product.salePrice > 0 && product.salePrice < product.price,
        discountPercentage:
          product.salePrice > 0 && product.salePrice < product.price
            ? Math.round(
                ((product.price - product.salePrice) / product.price) * 100
              )
            : 0,
        isOutOfStock: (product.totalStock || 0) === 0,
        lowStock:
          (product.totalStock || 0) > 0 && (product.totalStock || 0) < 10,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...wishlist._doc,
        items: populatedWishlistItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error removing from wishlist",
    });
  }
};

const checkProductInWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required!",
      });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: { isInWishlist: false },
      });
    }

    const isInWishlist = wishlist.items.some(
      (item) => item.productId.toString() === productId
    );

    res.status(200).json({
      success: true,
      data: { isInWishlist },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error checking wishlist status",
    });
  }
};

module.exports = {
  addToWishlist,
  fetchWishlistItems,
  removeFromWishlist,
  checkProductInWishlist,
};
