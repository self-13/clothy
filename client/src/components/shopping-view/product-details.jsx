import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Heart, HeartOff } from "lucide-react";
import {
  addToWishlist,
  removeFromWishlist,
  checkProductInWishlist,
} from "@/store/shop/wishlist-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const { toast } = useToast();

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

    // Check if the selected size has sufficient stock
    const sizeStock = productDetails?.sizes?.find(
      (s) => s.size === selectedSize
    );
    if (!sizeStock || sizeStock.stock < quantity) {
      toast({
        title: `Not enough stock for size ${selectedSize}`,
        variant: "destructive",
      });
      return;
    }

    // Check if the same product with same size already exists in cart
    const existingCartItem = cartItems.items?.find(
      (item) =>
        item.productId === productDetails?._id &&
        item.selectedSize === selectedSize
    );

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (sizeStock.stock < newQuantity) {
        toast({
          title: `Only ${sizeStock.stock} items available for size ${selectedSize}`,
          variant: "destructive",
        });
        return;
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: productDetails?._id,
        quantity: quantity,
        selectedSize: selectedSize,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product added to cart successfully",
        });
        setQuantity(1);
        setSelectedSize("");
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
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setSelectedSize("");
    setQuantity(1);
    setIsInWishlist(false);
  }

  function handleAddReview() {
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

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  // Get available sizes with stock
  const availableSizes =
    productDetails?.sizes?.filter((size) => size.stock > 0) || [];

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 p-4 sm:p-8 max-w-[95vw] sm:max-w-[90vw] lg:max-w-[70vw] overflow-y-auto max-h-[90vh]">
        {/* Left Side - Product Image with Wishlist Button */}
        <div className="w-full flex justify-center items-center relative">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            className="w-full max-w-[500px] h-auto rounded-lg object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background"
            onClick={handleToggleWishlist}
            disabled={!user}
          >
            {isInWishlist ? (
              <HeartOff className="h-5 w-5 text-red-500 fill-red-500" />
            ) : (
              <Heart className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Right Side - Product Info */}
        <div className="flex flex-col gap-4">
          {/* Title + Description */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {productDetails?.title}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg mt-2">
              {productDetails?.description}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <p
              className={`text-xl sm:text-2xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              ₹{productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 && (
              <p className="text-lg sm:text-xl font-bold text-muted-foreground">
                ₹{productDetails?.salePrice}
              </p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarRatingComponent rating={averageReview} />
            <span className="text-muted-foreground text-sm">
              ({averageReview.toFixed(2)})
            </span>
          </div>

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="size">Select Size</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose size" />
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

          {/* Quantity Selector */}
          {selectedSize && (
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="px-4 py-2 border rounded-md">{quantity}</span>
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
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div>
            {availableSizes.length === 0 ? (
              <Button className="w-full opacity-60 cursor-not-allowed">
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleAddToCart}
                disabled={!selectedSize}
              >
                Add to Cart
              </Button>
            )}
          </div>

          <Separator />

          {/* Reviews */}
          <div className="flex flex-col gap-4 max-h-[250px] overflow-y-auto pr-2">
            <h2 className="text-lg sm:text-xl font-bold">Reviews</h2>
            <div className="grid gap-4">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem, index) => (
                  <div key={index} className="flex gap-3">
                    <Avatar className="w-9 h-9 border">
                      <AvatarFallback>
                        {reviewItem?.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <h3 className="font-semibold">{reviewItem?.userName}</h3>
                      <div className="flex items-center gap-1">
                        <StarRatingComponent rating={reviewItem?.reviewValue} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No Reviews</p>
              )}
            </div>
          </div>

          {/* Add Review */}
          <div className="mt-4 flex flex-col gap-2">
            <Label>Write a review</Label>
            <div className="mt-4 flex flex-centre gap-2">
              <StarRatingComponent
                rating={rating}
                handleRatingChange={handleRatingChange}
              />
            </div>
            <Input
              name="reviewMsg"
              value={reviewMsg}
              onChange={(e) => setReviewMsg(e.target.value)}
              placeholder="Write a review..."
            />
            <Button
              onClick={handleAddReview}
              disabled={reviewMsg.trim() === ""}
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
