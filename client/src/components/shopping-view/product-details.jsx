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

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);

  const { toast } = useToast();

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
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
    if (productDetails !== null) {
      dispatch(getReviews(productDetails?._id));
    }
  }, [productDetails, dispatch]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 p-4 sm:p-8 max-w-[95vw] sm:max-w-[90vw] lg:max-w-[70vw] overflow-y-auto max-h-[90vh]">
        {/* Left Side - Product Image */}
        <div className="w-full flex justify-center items-center">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            className="w-full max-w-[500px] h-auto rounded-lg object-cover"
          />
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

          {/* Add to Cart */}
          <div>
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full opacity-60 cursor-not-allowed">
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock
                  )
                }
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
                      <StarRatingComponent rating={reviewItem?.reviewValue} />
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
