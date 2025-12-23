const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, selectedSize, selectedColor } =
      req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please login first!",
      });
    }

    if (
      !productId ||
      quantity <= 0 ||
      !selectedSize ||
      !selectedColor
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid data provided! Size and color selection are required.",
      });
    }

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
      });
    }

    // Check if selected color is available
    if (!product.colors.includes(selectedColor)) {
      return res.status(400).json({
        success: false,
        message: "Selected color is not available for this product",
      });
    }

    // Check if selected size is available and has sufficient stock
    const sizeStock = product.sizes.find((s) => s.size === selectedSize);
    if (!sizeStock) {
      return res.status(400).json({
        success: false,
        message: "Selected size is not available for this product",
      });
    }

    if (sizeStock.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock for size ${selectedSize}. Only ${sizeStock.stock} available.`,
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if same product with same size and color already exists in cart
    const findCurrentProductIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (findCurrentProductIndex === -1) {
      cart.items.push({
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });
    } else {
      const newQuantity =
        cart.items[findCurrentProductIndex].quantity + quantity;

      // Check stock again before updating quantity
      if (sizeStock.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for size ${selectedSize}. Only ${sizeStock.stock} available.`,
        });
      }

      cart.items[findCurrentProductIndex].quantity = newQuantity;
    }

    await cart.save();

    // Populate cart with product details
    await cart.populate({
      path: "items.productId",
      select: "images title price salePrice brand colors sizes averageReview",
    });

    const populatedItems = cart.items.map((item) => ({
      ...item.toObject(),
      productDetails: item.productId
        ? {
          _id: item.productId._id,
          title: item.productId.title,
          images: item.productId.images,
          price: item.productId.price,
          salePrice: item.productId.salePrice,
          brand: item.productId.brand,
          colors: item.productId.colors,
          sizes: item.productId.sizes,
          averageReview: item.productId.averageReview,
        }
        : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart.toObject(),
        items: populatedItems,
      },
    });
  } catch (error) {
    console.log("Error in addToCart:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while adding to cart",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is mandatory!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select:
        "images title price salePrice brand colors sizes averageReview isActive",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Filter out inactive products and populate cart items
    const validItems = cart.items.filter(
      (item) => item.productId && item.productId.isActive
    );

    // Update cart if some items were removed
    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const populatedItems = validItems.map((item) => {
      const product = item.productId;
      const selectedSizeStock = product.sizes.find(
        (s) => s.size === item.selectedSize
      );

      return {
        _id: item._id,
        productId: product._id,
        title: product.title,
        images: product.images,
        price: product.price,
        salePrice: product.salePrice,
        brand: product.brand,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        availableSizes: product.sizes,
        availableColors: product.colors,
        averageReview: product.averageReview,
        stock: selectedSizeStock ? selectedSizeStock.stock : 0,
        isAvailable: selectedSizeStock
          ? selectedSizeStock.stock >= item.quantity
          : false,
      };
    });

    // Calculate cart summary
    const cartSummary = populatedItems.reduce(
      (summary, item) => {
        const itemPrice = item.salePrice || item.price;
        const itemTotal = itemPrice * item.quantity;

        return {
          totalItems: summary.totalItems + item.quantity,
          subtotal: summary.subtotal + itemTotal,
          totalDiscount:
            summary.totalDiscount +
            (item.salePrice
              ? (item.price - item.salePrice) * item.quantity
              : 0),
          estimatedTotal: summary.estimatedTotal + itemTotal,
        };
      },
      { totalItems: 0, subtotal: 0, totalDiscount: 0, estimatedTotal: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        items: populatedItems,
        summary: cartSummary,
        cartId: cart._id,
      },
    });
  } catch (error) {
    console.log("Error in fetchCartItems:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching cart items",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity, selectedSize, selectedColor } =
      req.body;

    if (
      !userId ||
      !productId ||
      quantity <= 0 ||
      !selectedSize ||
      !selectedColor
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present!",
      });
    }

    // Check stock before updating quantity
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
      });
    }

    const sizeStock = product.sizes.find((s) => s.size === selectedSize);

    if (!sizeStock || sizeStock.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock for size ${selectedSize}. Only ${sizeStock?.stock || 0
          } available.`,
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    // Return updated cart
    await cart.populate({
      path: "items.productId",
      select: "images title price salePrice brand colors sizes averageReview",
    });

    const populatedItems = cart.items.map((item) => {
      const product = item.productId;
      const selectedSizeStock = product.sizes.find(
        (s) => s.size === item.selectedSize
      );

      return {
        _id: item._id,
        productId: product._id,
        title: product.title,
        images: product.images,
        price: product.price,
        salePrice: product.salePrice,
        brand: product.brand,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        availableSizes: product.sizes,
        availableColors: product.colors,
        averageReview: product.averageReview,
        stock: selectedSizeStock ? selectedSizeStock.stock : 0,
        isAvailable: selectedSizeStock
          ? selectedSizeStock.stock >= item.quantity
          : false,
      };
    });

    const cartSummary = populatedItems.reduce(
      (summary, item) => {
        const itemPrice = item.salePrice || item.price;
        const itemTotal = itemPrice * item.quantity;

        return {
          totalItems: summary.totalItems + item.quantity,
          subtotal: summary.subtotal + itemTotal,
          totalDiscount:
            summary.totalDiscount +
            (item.salePrice
              ? (item.price - item.salePrice) * item.quantity
              : 0),
          estimatedTotal: summary.estimatedTotal + itemTotal,
        };
      },
      { totalItems: 0, subtotal: 0, totalDiscount: 0, estimatedTotal: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        items: populatedItems,
        summary: cartSummary,
        cartId: cart._id,
      },
    });
  } catch (error) {
    console.log("Error in updateCartItemQty:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating cart item quantity",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId, selectedSize, selectedColor } = req.params;

    if (!userId || !productId || !selectedSize || !selectedColor) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Filter by productId, selectedSize, and selectedColor
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        )
    );

    await cart.save();

    // Populate after saving to get updated data
    await cart.populate({
      path: "items.productId",
      select: "images title price salePrice brand colors sizes averageReview",
    });

    const populatedItems = cart.items.map((item) => {
      const product = item.productId;
      const selectedSizeStock = product.sizes.find(
        (s) => s.size === item.selectedSize
      );

      return {
        _id: item._id,
        productId: product._id,
        title: product.title,
        images: product.images,
        price: product.price,
        salePrice: product.salePrice,
        brand: product.brand,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        availableSizes: product.sizes,
        availableColors: product.colors,
        averageReview: product.averageReview,
        stock: selectedSizeStock ? selectedSizeStock.stock : 0,
        isAvailable: selectedSizeStock
          ? selectedSizeStock.stock >= item.quantity
          : false,
      };
    });

    const cartSummary = populatedItems.reduce(
      (summary, item) => {
        const itemPrice = item.salePrice || item.price;
        const itemTotal = itemPrice * item.quantity;

        return {
          totalItems: summary.totalItems + item.quantity,
          subtotal: summary.subtotal + itemTotal,
          totalDiscount:
            summary.totalDiscount +
            (item.salePrice
              ? (item.price - item.salePrice) * item.quantity
              : 0),
          estimatedTotal: summary.estimatedTotal + itemTotal,
        };
      },
      { totalItems: 0, subtotal: 0, totalDiscount: 0, estimatedTotal: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        items: populatedItems,
        summary: cartSummary,
        cartId: cart._id,
      },
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.log("Error in deleteCartItem:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while removing item from cart",
    });
  }
};

// New: Clear entire cart
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        items: [],
        summary: {
          totalItems: 0,
          subtotal: 0,
          totalDiscount: 0,
          estimatedTotal: 0,
        },
        cartId: cart._id,
      },
    });
  } catch (error) {
    console.log("Error in clearCart:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while clearing cart",
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
  clearCart,
};
