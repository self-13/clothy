import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  ShoppingBag,
  Heart,
  Plus,
  Minus,
  ChevronRight,
  Check,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { addReview, getReviews } from "@/store/shop/review-slice";
import {
  addToWishlist,
  removeFromWishlist,
  checkProductInWishlist,
} from "@/store/shop/wishlist-slice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StarRatingComponent from "@/components/common/star-rating";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/shopping-view/footer";
import { Separator } from "@/components/ui/separator";

export default function ShoppingProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { productDetails, isLoading } = useSelector((state: any) => state.shopProducts);
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const { reviews } = useSelector((state: any) => state.shopReview);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string | number>("all");
  const [reviewSort, setReviewSort] = useState("recent");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const reviewRef = useRef<HTMLDivElement | null>(null);

  const handleScrollToReviews = () => {
    reviewRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id) as any);
      dispatch(getReviews(id) as any);

      if (isAuthenticated) {
        dispatch(checkProductInWishlist({ productId: id }) as any).then((data: any) => {
          setIsInWishlist(data.payload?.data?.isInWishlist || false);
        });
      }
    }
  }, [id, dispatch, isAuthenticated]);

  useEffect(() => {
    if (productDetails?.images?.length > 0) {
      setSelectedImage(productDetails.images[0]);
    } else if (productDetails?.image) {
      setSelectedImage(productDetails.image);
    }
  }, [productDetails]);

  // Set default size and colour when productDetails loads
  useEffect(() => {
    if (productDetails) {
      if (productDetails.sizes?.length > 0) {
        const firstInStock = productDetails.sizes.find(
          (s: { size: string; stock: number }) => s.stock > 0
        );
        setSelectedSize(firstInStock ? firstInStock.size : productDetails.sizes[0].size);
      } else {
        setSelectedSize("");
      }

      if (productDetails.colors?.length > 0) {
        setSelectedColor(productDetails.colors[0]);
      } else {
        setSelectedColor("");
      }
    }
  }, [productDetails]);

  const handleAddToCart = () => {
    const hasSizes = Boolean(productDetails?.sizes && productDetails.sizes.length > 0);
    const hasColors = Boolean(productDetails?.colors && productDetails.colors.length > 0);

    const isMissingSize = hasSizes && !selectedSize;
    const isMissingColor = hasColors && !selectedColor;

    if (isMissingSize && isMissingColor) {
      toast({
        title: "Please select size and colour",
        description: "Choose your desired size and colour before adding to bag.",
        variant: "destructive",
      });
      return;
    }

    if (isMissingSize) {
      toast({
        title: "Please select size",
        description: "Choose your desired size before adding to bag.",
        variant: "destructive",
      });
      return;
    }

    if (isMissingColor) {
      toast({
        title: "Please select colour",
        description: "Choose your desired colour before adding to bag.",
        variant: "destructive",
      });
      return;
    }

    if (hasSizes && selectedSize) {
      const sizeStock = productDetails.sizes.find(
        (s: { size: string; stock: number }) => s.size === selectedSize
      );
      if (!sizeStock || sizeStock.stock < quantity) {
        toast({
          title: `Only ${sizeStock?.stock || 0} items available for size ${selectedSize}`,
          variant: "destructive",
        });
        return;
      }
    }

    dispatch(
      addToCart({
        productId: id,
        quantity,
        userId: user?.id,
        selectedSize,
        selectedColor,
      }) as any
    ).then((data: any) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id) as any);
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 2000);
        toast({ title: "Item added to your shopping bag." });
      } else {
        toast({
          title: data?.payload?.message || data?.error?.message || "Failed to add item to bag.",
          variant: "destructive",
        });
      }
    });
  };

  const handleAddReview = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to share a client review.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select an evaluation score from 1 to 5 stars.",
        variant: "destructive",
      });
      return;
    }

    if (!reviewMsg.trim()) {
      toast({
        title: "Commentary Required",
        description: "Please provide your commentary on fit and craftsmanship.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    dispatch(
      addReview({
        productId: id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg.trim(),
        reviewValue: rating,
      }) as any
    )
      .then((data: any) => {
        setIsSubmittingReview(false);
        if (data?.payload?.success) {
          setRating(0);
          setHoverRating(0);
          setReviewMsg("");
          if (id) dispatch(getReviews(id) as any);
          toast({
            title: "Review Published",
            description: "Your review has been authenticated and added to the archives.",
          });
        } else {
          toast({
            title: "Submission Declined",
            description:
              data?.payload?.message ||
              data?.error?.message ||
              "Only verified purchasers of this item can submit a review.",
            variant: "destructive",
          });
        }
      })
      .catch((err: any) => {
        setIsSubmittingReview(false);
        toast({
          title: "Submission Error",
          description: err?.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      });
  };

  const totalReviewsCount = reviews?.length || 0;

  const averageReviewScore =
    totalReviewsCount > 0
      ? reviews.reduce((sum: number, item: any) => sum + item.reviewValue, 0) / totalReviewsCount
      : productDetails?.averageReview || 0;

  const ratingCounts = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews?.filter((r: any) => Math.round(r.reviewValue) === star).length || 0;
      const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
      return { star, count, percentage };
    });
  }, [reviews, totalReviewsCount]);

  const recommendationRate = useMemo(() => {
    if (totalReviewsCount === 0) return 100;
    const positive = reviews?.filter((r: any) => r.reviewValue >= 4).length || 0;
    return Math.round((positive / totalReviewsCount) * 100);
  }, [reviews, totalReviewsCount]);

  const filteredReviews = useMemo(() => {
    return (reviews || [])
      .filter((r: any) => {
        if (selectedRatingFilter === "all") return true;
        return Math.round(r.reviewValue) === Number(selectedRatingFilter);
      })
      .sort((a: any, b: any) => {
        if (reviewSort === "highest") return b.reviewValue - a.reviewValue;
        if (reviewSort === "lowest") return a.reviewValue - b.reviewValue;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [reviews, selectedRatingFilter, reviewSort]);

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return "5.0 — Exceptional";
      case 4:
        return "4.0 — Highly Recommended";
      case 3:
        return "3.0 — Meets Expectations";
      case 2:
        return "2.0 — Below Expectations";
      case 1:
        return "1.0 — Poor Fit / Quality";
      default:
        return "Select rating";
    }
  };

  const formatReviewDate = (dateString?: string) => {
    if (!dateString) return "Recent review";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recent review";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in to save items to your wishlist", variant: "destructive" });
      navigate("/auth/login");
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist({ productId: id }) as any).then((data: any) => {
        if (data?.payload?.success) {
          setIsInWishlist(false);
          toast({ title: "Removed from wishlist." });
        }
      });
    } else {
      dispatch(addToWishlist({ productId: id }) as any).then((data: any) => {
        if (data?.payload?.success) {
          setIsInWishlist(true);
          toast({ title: "Saved to your wishlist." });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!productDetails) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FAF9F6]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Garment not found</p>
      </div>
    );
  }

  const allImages = productDetails.images?.length > 0 ? productDetails.images : [productDetails.image];
  const hasSale = productDetails.salePrice > 0 && productDetails.salePrice < productDetails.price;

  return (
    <div className="bg-[#FAF9F6] text-[#121212] min-h-screen font-sans pt-20">
      
      {/* Refined Minimal Breadcrumb */}
      <div className="border-b border-zinc-200/70 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-8 py-3.5 flex items-center gap-2 text-xs font-medium text-zinc-400">
          <span className="hover:text-black cursor-pointer transition-colors" onClick={() => navigate("/")}>
            Home
          </span>
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          <span className="hover:text-black cursor-pointer capitalize transition-colors" onClick={() => navigate("/shop/listing")}>
            {productDetails.category}
          </span>
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          <span className="text-[#121212] font-semibold truncate max-w-xs">{productDetails.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Gallery: Sticky on Desktop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-[3/4] bg-[#F4F3F0] rounded-sm relative overflow-hidden flex items-center justify-center p-8 sm:p-12">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={selectedImage}
                  alt={productDetails.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-contain"
                />
              </AnimatePresence>

              {/* Minimal Sale Tag */}
              {hasSale && (
                <div className="absolute top-4 left-4 bg-[#121212] text-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] rounded-sm">
                  Sale -₹{productDetails.price - productDetails.salePrice}
                </div>
              )}

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
                  isInWishlist
                    ? "bg-[#121212] text-white"
                    : "bg-white/90 text-zinc-500 hover:text-black shadow-xs"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {allImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-20 flex-shrink-0 rounded-sm overflow-hidden p-1 bg-[#F4F3F0] transition-all ${
                      selectedImage === img
                        ? "ring-1 ring-[#121212]"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-contain" alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Details: Sticky Details */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-8">
            
            {/* Header info */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block">
                {productDetails.brand}
              </span>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#121212] leading-[1.12] font-normal">
                {productDetails.title}
              </h1>

              {/* Price & Rating */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-semibold text-[#121212]">
                    ₹{hasSale ? productDetails.salePrice : productDetails.price}
                  </span>
                  {hasSale && (
                    <span className="text-sm text-zinc-400 line-through">₹{productDetails.price}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 cursor-pointer" onClick={handleScrollToReviews}>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.floor(productDetails.averageReview || 5)
                            ? "fill-current"
                            : "text-zinc-200 fill-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500 font-medium underline underline-offset-4">
                    ({reviews?.length || 0})
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-zinc-200/70" />

            {/* Selection details */}
            <div className="space-y-6">
              
              {/* Color list */}
              {productDetails.colors?.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 block">
                    Color: <span className="text-black normal-case font-medium">{selectedColor || "Select"}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {productDetails.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor((prev) => (prev === color ? "" : color))}
                        className={`h-9 px-4 rounded-sm text-xs font-medium uppercase tracking-[0.1em] border transition-all active:scale-95 ${
                          selectedColor === color
                            ? "bg-[#121212] text-white border-[#121212]"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-black"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes list */}
              {productDetails.sizes?.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                      Size: <span className="text-black normal-case font-medium">{selectedSize || "Select"}</span>
                    </span>
                    <span className="text-[11px] font-medium text-zinc-500 underline underline-offset-4 cursor-pointer hover:text-black">
                      Sizing Guide
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {productDetails.sizes.map((s: { size: string; stock: number }) => (
                      <button
                        key={s.size}
                        disabled={s.stock === 0}
                        onClick={() => setSelectedSize((prev) => (prev === s.size ? "" : s.size))}
                        title={s.stock === 0 ? "Out of stock" : undefined}
                        className={`min-w-[44px] h-10 px-3 rounded-sm text-xs font-semibold uppercase border transition-all active:scale-95 ${
                          s.stock === 0
                            ? "bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed line-through"
                            : selectedSize === s.size
                            ? "bg-[#121212] text-white border-[#121212]"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-black"
                        }`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector & Add to Bag */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  
                  {/* Quantity */}
                  <div className="flex items-center border border-zinc-300 rounded-sm h-12 bg-white w-28">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-full flex items-center justify-center text-zinc-600 hover:text-black active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center text-xs font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-full flex items-center justify-center text-zinc-600 hover:text-black active:scale-95"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={productDetails.totalStock === 0}
                    className="flex-1 h-12 bg-[#121212] hover:bg-black text-white text-xs font-semibold uppercase tracking-[0.16em] rounded-sm transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2.5 shadow-sm"
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Added to Shopping Bag</span>
                      </>
                    ) : productDetails.totalStock === 0 ? (
                      "Out of Stock"
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Separator className="bg-zinc-200/70" />

            {/* Description & Editorial Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Design & Details
              </h3>
              <p className="text-zinc-600 text-sm font-light leading-relaxed">
                {productDetails.description || "Crafted from fine natural fibers with tailored seams and mindful proportions designed for everyday versatility."}
              </p>
            </div>

            {/* Quiet Service Guarantee */}
            <div className="p-4 bg-white border border-zinc-200/70 rounded-sm space-y-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Complimentary standard shipping on all domestic orders</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span>Mindful 10-day exchange and return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div ref={reviewRef} className="mt-24 pt-16 border-t border-zinc-200/70 font-sans">
          <div className="max-w-5xl mx-auto space-y-12">
            
            {/* Header & Rating Aggregate Summary */}
            <div className="bg-[#FAF9F6] border border-zinc-200/80 p-6 sm:p-8 space-y-6 rounded-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-zinc-200/60">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                    Community Feedback & Fit Archive
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#121212]">
                    Client Reviews & Impressions
                  </h2>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black tracking-tight text-[#121212]">
                        {averageReviewScore.toFixed(1)}
                      </span>
                      <span className="text-xs font-semibold text-zinc-400">/ 5.0</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(averageReviewScore)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-zinc-200 text-zinc-200"
                          }`}
                        />
                      ))}
                      <span className="text-[11px] font-mono text-zinc-500 ml-2">
                        ({totalReviewsCount} {totalReviewsCount === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  </div>

                  {totalReviewsCount > 0 && (
                    <div className="hidden sm:block text-right border-l border-zinc-200/80 pl-6 space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 text-[10px] font-semibold uppercase tracking-wider text-zinc-800 rounded-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{recommendationRate}% Recommendation</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 tracking-wider">
                        Verified Client Satisfaction
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Distribution Bars */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Rating Breakdown
                  </p>
                  {selectedRatingFilter !== "all" && (
                    <button
                      onClick={() => setSelectedRatingFilter("all")}
                      className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 hover:text-black underline"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {ratingCounts.map(({ star, count, percentage }) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRatingFilter((prev) => (prev === star ? "all" : star))}
                      className={`group flex items-center justify-between gap-2 p-2 rounded-sm border transition-all text-left ${
                        selectedRatingFilter === star
                          ? "bg-black text-white border-black"
                          : "bg-white border-zinc-200/80 hover:border-black"
                      }`}
                    >
                      <span className="text-xs font-semibold flex items-center gap-1">
                        {star} <Star className={`w-3 h-3 ${selectedRatingFilter === star ? "fill-white text-white" : "fill-amber-400 text-amber-400"}`} />
                      </span>
                      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden mx-1">
                        <div
                          className={`h-full transition-all duration-500 ${
                            selectedRatingFilter === star ? "bg-white" : "bg-zinc-800"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-mono ${selectedRatingFilter === star ? "text-zinc-300" : "text-zinc-400"}`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Review Submission Column (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-zinc-200/80 rounded-sm p-6 sm:p-8 space-y-6 sticky top-28 shadow-sm">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                      Share Perspective
                    </span>
                    <h3 className="font-serif text-xl text-[#121212]">Write a Review</h3>
                    <p className="text-xs text-zinc-500 font-light leading-relaxed mt-1">
                      Share your impressions on cut, silhouette, textile hand-feel, and sizing accuracy.
                    </p>
                  </div>

                  {!isAuthenticated ? (
                    <div className="py-8 text-center space-y-3 bg-[#FAF9F6] border border-zinc-200/70 p-4 rounded-sm">
                      <p className="text-xs text-zinc-600 font-light">
                        Please sign in with your account to leave a verified client critique.
                      </p>
                      <button
                        onClick={() => navigate("/auth/login")}
                        className="px-5 py-2.5 bg-[#121212] text-white hover:bg-black rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        Sign In to Review
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5 pt-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 block">
                            Overall Rating *
                          </label>
                          <span className="text-xs font-semibold text-zinc-700">
                            {getRatingLabel(hoverRating || rating)}
                          </span>
                        </div>
                        <div className="py-1">
                          <StarRatingComponent
                            rating={rating}
                            hoverRating={hoverRating}
                            onHoverChange={(val) => setHoverRating(val)}
                            handleRatingChange={(val) => setRating(val)}
                            size="lg"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 block">
                            Your Impressions *
                          </label>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {reviewMsg.length} / 500
                          </span>
                        </div>
                        <textarea
                          value={reviewMsg}
                          maxLength={500}
                          onChange={(e) => setReviewMsg(e.target.value)}
                          placeholder="Comment on fit precision, fabric weight, drape, and wear comfort..."
                          className="w-full h-32 bg-[#FAF9F6] border border-zinc-300 p-3.5 rounded-sm text-xs font-normal focus:border-black focus:bg-white outline-none transition-colors resize-none placeholder:text-zinc-400 leading-relaxed"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddReview}
                        disabled={isSubmittingReview || rating === 0 || !reviewMsg.trim()}
                        className="w-full h-12 bg-[#121212] text-white hover:bg-black rounded-sm text-xs font-semibold uppercase tracking-[0.15em] transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
                      >
                        {isSubmittingReview ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting Critique...</span>
                          </>
                        ) : (
                          <span>Submit Review</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Feed Column (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Feed Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200/80">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRatingFilter("all")}
                      className={`px-3 py-1 text-xs font-semibold rounded-sm border transition-all ${
                        selectedRatingFilter === "all"
                          ? "bg-black text-white border-black"
                          : "bg-white text-zinc-500 border-zinc-200 hover:border-black hover:text-black"
                      }`}
                    >
                      All ({totalReviewsCount})
                    </button>
                    {[5, 4, 3, 2, 1].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedRatingFilter((prev) => (prev === s ? "all" : s))}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-sm border transition-all flex items-center gap-1 ${
                          selectedRatingFilter === s
                            ? "bg-black text-white border-black"
                            : "bg-white text-zinc-500 border-zinc-200 hover:border-black hover:text-black"
                        }`}
                      >
                        <span>{s}</span>
                        <Star className="w-3 h-3 fill-current" />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400 font-medium">Sort:</span>
                    <select
                      value={reviewSort}
                      onChange={(e) => setReviewSort(e.target.value)}
                      className="bg-transparent text-xs font-semibold uppercase tracking-wider text-black border-none focus:outline-none cursor-pointer"
                    >
                      <option value="recent">Newest First</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                    </select>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {filteredReviews && filteredReviews.length > 0 ? (
                    filteredReviews.map((item: any, idx: number) => (
                      <div
                        key={item._id || idx}
                        className="p-6 bg-white border border-zinc-200/70 rounded-sm space-y-3.5 hover:border-zinc-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200">
                              <AvatarFallback className="text-xs font-bold">
                                {(item.userName || "C").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[#121212] uppercase tracking-wider">
                                  {item.userName || "Verified Client"}
                                </span>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[9px] font-semibold uppercase tracking-wider rounded-sm">
                                  <Check className="w-2.5 h-2.5 text-emerald-600" /> Verified Buyer
                                </span>
                              </div>
                              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                                {formatReviewDate(item.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= item.reviewValue
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-zinc-200 fill-zinc-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-zinc-600 font-light leading-relaxed pl-12">
                          "{item.reviewMessage}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 px-6 text-center bg-white border border-dashed border-zinc-200 rounded-sm space-y-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#121212]">
                          {selectedRatingFilter !== "all"
                            ? `No ${selectedRatingFilter}-Star Reviews Found`
                            : "No Reviews Submitted Yet"}
                        </p>
                        <p className="text-xs text-zinc-400 font-light max-w-sm mx-auto">
                          {selectedRatingFilter !== "all"
                            ? "Try choosing a different star filter or reset to view all client notes."
                            : "Be the first client to articulate your thoughts on fit, fabric feel, and drape for this piece."}
                        </p>
                      </div>
                      {selectedRatingFilter !== "all" && (
                        <button
                          type="button"
                          onClick={() => setSelectedRatingFilter("all")}
                          className="text-xs font-semibold uppercase tracking-wider text-[#121212] underline underline-offset-4"
                        >
                          Show All Reviews
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
