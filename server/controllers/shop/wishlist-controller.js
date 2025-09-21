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
      select: "image title price salePrice category brand averageReview", // Same fields as cart
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

    const populatedWishlistItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      category: item.productId.category,
      brand: item.productId.brand,
      averageReview: item.productId.averageReview,
      addedAt: item.addedAt,
    }));

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
      message: "Error fetching wishlist",
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
      select: "image title price salePrice category brand averageReview",
    });

    const populatedWishlistItems = wishlist.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      category: item.productId ? item.productId.category : null,
      brand: item.productId ? item.productId.brand : null,
      averageReview: item.productId ? item.productId.averageReview : null,
      addedAt: item.addedAt,
    }));

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
