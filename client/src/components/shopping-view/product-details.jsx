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
import {
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  X,
  Check,
  ChevronRight,
  Heart,
  Share2,
  Menu,
  ArrowLeft,
  HeartOff,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import StarRatingComponent from "../common/star-rating";
import { addReview, getReviews } from "@/store/shop/review-slice";
import {
  addToWishlist,
  removeFromWishlist,
  checkProductInWishlist,
} from "@/store/shop/wishlist-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // "details" or "reviews"

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { isLoading, error } = useSelector((state) => state.shopProducts);
  const { reviews } = useSelector((state) => state.shopReview);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const { toast } = useToast();

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart() {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }

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
          title: "Added to Cart",
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

  function handleToggleWishlist() {
    if (!user) {
      toast({
        title: "Please login to add to wishlist",
        variant: "destructive",
      });
      return;
    }

    if (isInWishlist) {
      dispatch(
        removeFromWishlist({
          userId: user?.id,
          productId: productDetails?._id,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          setIsInWishlist(false);
          toast({
            title: "Removed from wishlist",
          });
        }
      });
    } else {
      dispatch(
        addToWishlist({
          userId: user?.id,
          productId: productDetails?._id,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          setIsInWishlist(true);
          toast({
            title: "Added to wishlist",
          });
        } else if (data?.payload?.message) {
          toast({
            title: data.payload.message,
            variant: "destructive",
          });
        }
      });
    }
  }

  function handleDialogClose() {
    setOpen(false);
    setTimeout(() => {
      dispatch(resetProductDetails());
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
      setActiveImage(0);
      setRating(0);
      setReviewMsg("");
      setIsInWishlist(false);
      setActiveTab("details");
    }, 300);
  }

  function handleAddReview() {
    if (!user) {
      toast({
        title: "Please login to add a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null && user) {
      dispatch(getReviews(productDetails?._id));

      // Check if product is in wishlist
      dispatch(
        checkProductInWishlist({
          userId: user.id,
          productId: productDetails?._id,
        })
      ).then((data) => {
        setIsInWishlist(data.payload?.data?.isInWishlist || false);
      });
    }
  }, [productDetails, dispatch, user]);

  // Calculate average review
  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : productDetails?.averageReview || 0;

  // If no product details, show loading or error
  if (!productDetails) {
    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw]">
          <div className="flex flex-col items-center justify-center py-12">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
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
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] sm:h-[85vh] lg:h-[80vh] p-0 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDialogClose}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium text-gray-900">
              Product Details
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDialogClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Desktop Close Button */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 h-8 w-8 rounded-full bg-white border border-gray-300 hover:bg-gray-100"
            onClick={handleDialogClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Side - Product Images */}
            <div className="lg:col-span-7 p-4 sm:p-6 border-r border-gray-200">
              <div
                className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4`}
              >
                {/* Thumbnail Images */}
                <div
                  className={`flex ${
                    isMobile ? "flex-row order-2" : "flex-col order-1"
                  } gap-2 overflow-x-auto ${isMobile ? "pb-2" : ""}`}
                >
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 ${
                        isMobile ? "w-16 h-16" : "w-14 h-14"
                      } border rounded overflow-hidden ${
                        activeImage === index
                          ? "border-orange-500 border-2"
                          : "border-gray-300"
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

                {/* Main Image */}
                <div
                  className={`flex-1 ${
                    isMobile ? "order-1" : "order-2"
                  } relative`}
                >
                  <div className="aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {productImages.length > 0 ? (
                      <img
                        src={productImages[activeImage]}
                        alt={productDetails?.title}
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image Available
                      </div>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-3 right-3 h-10 w-10 bg-white border border-gray-300 rounded-full shadow-sm ${
                      isInWishlist ? "text-red-500" : "text-gray-500"
                    }`}
                    onClick={handleToggleWishlist}
                    disabled={!user}
                  >
                    {isInWishlist ? (
                      <Heart className="h-5 w-5 fill-current" />
                    ) : (
                      <Heart className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side - Product Info */}
            <div className="lg:col-span-5 p-4 sm:p-6 bg-white">
              <div className="space-y-4">
                {/* Breadcrumb - Hide on mobile */}
                {!isMobile && (
                  <div className="text-sm text-gray-500">
                    <span>Home</span>
                    <ChevronRight className="w-3 h-3 inline mx-1" />
                    <span className="capitalize">
                      {productDetails?.category}
                    </span>
                    <ChevronRight className="w-3 h-3 inline mx-1" />
                    <span className="capitalize">
                      {productDetails?.subcategory}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-normal text-gray-900 leading-tight">
                  {productDetails?.title}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(averageReview || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-300 text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-blue-600 text-sm hover:underline cursor-pointer">
                    {averageReview?.toFixed(1) || "0.0"} ratings
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-blue-600 text-sm hover:underline cursor-pointer">
                    {productDetails?.salesCount || 0} sold
                  </span>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  {hasSale ? (
                    <>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl sm:text-3xl text-gray-900">
                          ₹{productDetails?.salePrice}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{productDetails?.price}
                        </span>
                        <Badge className="bg-red-500 text-white text-sm">
                          {discountPercentage}% off
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl text-gray-900">
                      ₹{productDetails?.price || "0.00"}
                    </span>
                  )}
                </div>

                {/* Size Selection */}
                {availableSizes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-bold text-gray-900">
                        Size:{" "}
                        <span className="font-normal">{selectedSize}</span>
                      </Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size.size}
                          onClick={() => setSelectedSize(size.size)}
                          className={`px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                            selectedSize === size.size
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {size.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {availableColors.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-900">
                      Color:{" "}
                      <span className="font-normal capitalize">
                        {selectedColor}
                      </span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-2 border rounded-lg text-sm font-medium capitalize transition-all ${
                            selectedColor === color
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-900">
                    Quantity:
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-8 w-8"
                    >
                      -
                    </Button>
                    <span className="px-4 py-1 border rounded text-sm font-medium min-w-[40px] text-center">
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
                      className="h-8 w-8"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {availableSizes.length === 0 ||
                  productDetails?.totalStock === 0 ? (
                    <Button
                      className="w-full bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                      size="lg"
                      disabled
                    >
                      Out of Stock
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white border-orange-500 text-base sm:text-lg"
                        onClick={handleAddToCart}
                        disabled={!selectedSize}
                        size="lg"
                      >
                        Add to Cart
                      </Button>
                    </>
                  )}
                </div>

                {/* Delivery Info */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span>
                      <strong>Free delivery</strong> on online payments.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <RotateCcw className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span>
                      <strong>Return Policy</strong> 7 days returnable
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for Details and Reviews */}
          <div className="col-span-full border-t border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "details"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Product Details
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "reviews"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Reviews ({reviews?.length || 0})
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === "details" ? (
                <>
                  <h2 className="text-lg sm:text-xl font-bold mb-4">
                    Product details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 text-sm sm:text-base">
                          Brand
                        </span>
                        <span className="font-medium text-sm sm:text-base">
                          {productDetails?.brand}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 text-sm sm:text-base">
                          Category
                        </span>
                        <span className="font-medium text-sm sm:text-base capitalize">
                          {productDetails?.category}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 text-sm sm:text-base">
                          Subcategory
                        </span>
                        <span className="font-medium text-sm sm:text-base capitalize">
                          {productDetails?.subcategory}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 text-sm sm:text-base">
                          In Stock
                        </span>
                        <span className="font-medium text-sm sm:text-base">
                          {productDetails?.totalStock || 0} units
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 text-sm sm:text-base">
                          Sold
                        </span>
                        <span className="font-medium text-sm sm:text-base">
                          {productDetails?.salesCount || 0} units
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 text-sm sm:text-base">
                          Rating
                        </span>
                        <span className="font-medium text-sm sm:text-base">
                          {averageReview?.toFixed(1) || "0.0"}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {productDetails?.description && (
                    <div className="mt-6">
                      <h3 className="font-bold mb-2 text-sm sm:text-base">
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        {productDetails.description}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  {/* Add Review Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold mb-3 text-sm sm:text-base">
                      Write a Review
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Your Rating:
                        </span>
                        <StarRatingComponent
                          rating={rating}
                          handleRatingChange={handleRatingChange}
                        />
                      </div>
                      <Input
                        name="reviewMsg"
                        value={reviewMsg}
                        onChange={(e) => setReviewMsg(e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="text-sm"
                      />
                      <Button
                        onClick={handleAddReview}
                        disabled={reviewMsg.trim() === "" || rating === 0}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Submit Review
                      </Button>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div>
                    <h3 className="font-bold mb-4 text-sm sm:text-base">
                      Customer Reviews ({reviews?.length || 0})
                    </h3>
                    <div className="space-y-4">
                      {reviews && reviews.length > 0 ? (
                        reviews.map((reviewItem, index) => (
                          <div
                            key={index}
                            className="border-b pb-4 last:border-b-0"
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="w-8 h-8 border">
                                <AvatarFallback className="text-xs">
                                  {reviewItem?.userName?.[0]?.toUpperCase() ||
                                    "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm">
                                    {reviewItem?.userName}
                                  </h4>
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-3 h-3 ${
                                          star <= reviewItem.reviewValue
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "fill-gray-300 text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-700 text-sm">
                                  {reviewItem.reviewMessage}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No reviews yet. Be the first to review!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Action Bar */}
        {isMobile &&
          availableSizes.length > 0 &&
          productDetails?.totalStock > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  size="lg"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
