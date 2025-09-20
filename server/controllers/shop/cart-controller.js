const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, selectedSize } = req.body; // Add selectedSize

    if (!userId || !productId || quantity <= 0 || !selectedSize) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided! Size selection is required.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
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

    // Check if same product with same size already exists in cart
    const findCurrentProductIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedSize === selectedSize
    );

    if (findCurrentProductIndex === -1) {
      cart.items.push({ productId, quantity, selectedSize });
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
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
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
      select: "image title price salePrice sizes", // Include sizes
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
      selectedSize: item.selectedSize, // Include selected size
      availableSizes: item.productId.sizes, // Include available sizes
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity, selectedSize } = req.body; // Add selectedSize

    if (!userId || !productId || quantity <= 0 || !selectedSize) {
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
        item.selectedSize === selectedSize
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present!",
      });
    }

    // Check stock before updating quantity
    const product = await Product.findById(productId);
    const sizeStock = product.sizes.find((s) => s.size === selectedSize);

    if (!sizeStock || sizeStock.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock for size ${selectedSize}. Only ${
          sizeStock?.stock || 0
        } available.`,
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice sizes",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      availableSizes: item.productId ? item.productId.sizes : [],
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId, selectedSize } = req.params;

    if (!userId || !productId || !selectedSize) {
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

    // Filter by both productId and selectedSize
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.selectedSize === selectedSize
        )
    );

    await cart.save();

    // Populate after saving to get updated data
    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice sizes",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      availableSizes: item.productId ? item.productId.sizes : [],
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
};
