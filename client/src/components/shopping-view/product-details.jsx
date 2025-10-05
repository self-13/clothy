import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { resetProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ShoppingCart, Star, Truck, Shield, RotateCcw, X } from "lucide-react";
import { Badge } from "../ui/badge";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { isLoading, error } = useSelector((state) => state.shopProducts);

  const { toast } = useToast();

  // Debug logging
  useEffect(() => {
    if (productDetails) {
      console.log("🔍 ProductDetailsDialog - productDetails:", productDetails);
      console.log("🖼️ Product images:", productDetails.images);
      console.log("📏 Product sizes:", productDetails.sizes);
      console.log("🎨 Product colors:", productDetails.colors);
    }
  }, [productDetails]);

  function handleAddToCart() {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    // Check if the selected size has sufficient stock
    const sizeStock = productDetails?.sizes?.find(
      (s) => s.size === selectedSize
    );
    if (!sizeStock || sizeStock.stock < quantity) {
      toast({
        title: `Only ${
          sizeStock?.stock || 0
        } items available for size ${selectedSize}`,
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: productDetails?._id,
        quantity: quantity,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product added to cart successfully! 🎉",
          description: `${productDetails?.title} has been added to your cart.`,
        });
        setQuantity(1);
      } else if (data?.payload?.message) {
        toast({
          title: data.payload.message,
          variant: "destructive",
        });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    setTimeout(() => {
      dispatch(resetProductDetails());
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
      setActiveImage(0);
    }, 300);
  }

  // If no product details, show loading or error
  if (!productDetails) {
    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex flex-col items-center justify-center py-12">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading product details...</p>
              </>
            ) : error ? (
              <>
                <X className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-red-600 mb-4">
                  Failed to load product details
                </p>
                <Button onClick={handleDialogClose}>Close</Button>
              </>
            ) : (
              <p className="text-gray-600">No product data available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Get available sizes with stock
  const availableSizes =
    productDetails?.sizes?.filter((size) => size.stock > 0) || [];

  // Get available colors
  const availableColors = productDetails?.colors || [];

  // Check if product is on sale
  const hasSale =
    productDetails?.salePrice > 0 &&
    productDetails?.salePrice < productDetails?.price;
  const discountPercentage = hasSale
    ? Math.round(
        ((productDetails.price - productDetails.salePrice) /
          productDetails.price) *
          100
      )
    : 0;

  // Product images
  const productImages = productDetails?.images || [];

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6 max-w-[95vw] sm:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm"
          onClick={handleDialogClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Left Side - Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-50">
            {productImages.length > 0 ? (
              <img
                src={productImages[activeImage]}
                alt={productDetails?.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}

            {/* Sale Badge */}
            {hasSale && (
              <Badge className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 text-sm">
                {discountPercentage}% OFF
              </Badge>
            )}

            {/* Stock Badge */}
            {productDetails?.totalStock === 0 && (
              <Badge className="absolute top-3 right-3 bg-gray-500 text-white px-3 py-1 text-sm">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Thumbnail Images */}
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`flex-shrink-0 w-16 h-16 border-2 rounded-md overflow-hidden ${
                    activeImage === index
                      ? "border-blue-500"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productDetails?.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Product Info */}
        <div className="flex flex-col gap-6">
          {/* Title and Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {productDetails?.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {productDetails?.brand}
              </Badge>
              {productDetails?.isFeatured && (
                <Badge className="bg-purple-500 text-white text-xs">
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {productDetails?.title || "Product Title"}
            </h1>
            <p className="text-gray-600 mt-2 leading-relaxed">
              {productDetails?.description || "No description available."}
            </p>
          </div>

          {/* Rating and Sales */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">
                  {productDetails?.averageReview?.toFixed(1) || "0.0"}
                </span>
              </div>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-gray-500 text-sm">
              {productDetails?.salesCount || 0} sold
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {hasSale ? (
              <>
                <span className="text-3xl font-bold text-gray-900">
                  ₹{productDetails?.salePrice}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ₹{productDetails?.price}
                </span>
                <Badge variant="destructive" className="text-sm">
                  Save {discountPercentage}%
                </Badge>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ₹{productDetails?.price || "0.00"}
              </span>
            )}
          </div>

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="space-y-3">
              <Label htmlFor="size" className="text-base font-semibold">
                Select Size
              </Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your size" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((size) => (
                    <SelectItem key={size.size} value={size.size}>
                      {size.size} ({size.stock} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="space-y-3">
              <Label htmlFor="color" className="text-base font-semibold">
                Select Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    onClick={() => setSelectedColor(color)}
                    className="capitalize"
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {selectedSize && (
            <div className="space-y-3">
              <Label htmlFor="quantity" className="text-base font-semibold">
                Quantity
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  -
                </Button>
                <span className="px-6 py-2 border rounded-md text-lg font-semibold min-w-[60px] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const selectedSizeStock =
                      availableSizes.find((s) => s.size === selectedSize)
                        ?.stock || 0;
                    setQuantity(Math.min(selectedSizeStock, quantity + 1));
                  }}
                  disabled={
                    quantity >=
                    (availableSizes.find((s) => s.size === selectedSize)
                      ?.stock || 0)
                  }
                  className="h-10 w-10"
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {availableSizes.length === 0 || productDetails?.totalStock === 0 ? (
              <Button
                className="w-full opacity-60 cursor-not-allowed"
                size="lg"
              >
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full flex items-center gap-2"
                onClick={handleAddToCart}
                disabled={!selectedSize}
                size="lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart - ₹
                {hasSale
                  ? (productDetails.salePrice * quantity).toFixed(2)
                  : (productDetails.price * quantity).toFixed(2)}
              </Button>
            )}
          </div>

          {/* Product Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4" />
              Free shipping
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              1-year warranty
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RotateCcw className="w-4 h-4" />
              30-day returns
            </div>
          </div>

          {/* Product Specifications */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-gray-900">
              Product Specifications
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium capitalize">
                  {productDetails?.category}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Subcategory:</span>
                <span className="ml-2 font-medium capitalize">
                  {productDetails?.subcategory}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Brand:</span>
                <span className="ml-2 font-medium">
                  {productDetails?.brand}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Stock:</span>
                <span className="ml-2 font-medium">
                  {productDetails?.totalStock || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
