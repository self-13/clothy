import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { resetProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ShoppingCart,
  Star,
  Truck,
  Shield,
  ShieldCheck,
  RotateCcw,
  X,
  Check,
  ChevronRight,
  Heart,
  Share2,
  Menu,
  ArrowLeft,
  HeartOff,
  Sparkles,
  MessageSquare,
  Loader2,
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
import { motion, AnimatePresence } from "framer-motion";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState("all");
  const [reviewSort, setReviewSort] = useState("recent");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // "details" or "reviews"

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { reviews } = useSelector((state) => state.shopReview);
  const { isLoading, error } = useSelector((state) => state.shopProducts);
  const { toast } = useToast();

  const handleRatingChange = useCallback((getRating) => {
    setRating(getRating);
  }, []);

  // Set default size and colour when productDetails loads
  useEffect(() => {
    if (productDetails) {
      if (productDetails.sizes?.length > 0) {
        const firstInStock = productDetails.sizes.find((s) => s.stock > 0);
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

  function handleAddToCart() {
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
      const sizeStock = productDetails?.sizes?.find((s) => s.size === selectedSize);
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
        productId: productDetails?._id,
        quantity: quantity,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Item added to your shopping bag." });
      } else {
        toast({
          title: data?.payload?.message || data?.error?.message || "Failed to add item to bag.",
          variant: "destructive",
        });
      }
    });
  }

  function handleToggleWishlist() {
    if (!user) {
      toast({ title: "Authentication Required", description: "Log in to curate your wishlist.", variant: "destructive" });
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist({ productId: productDetails?._id })).then((data) => {
        if (data?.payload?.success) {
          setIsInWishlist(false);
          toast({ title: "Removed", description: "Asset removed from curation." });
        }
      });
    } else {
      dispatch(addToWishlist({ productId: productDetails?._id })).then((data) => {
        if (data?.payload?.success) {
          setIsInWishlist(true);
          toast({ title: "Curated", description: "Asset secured in your wishlist." });
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
      setIsInWishlist(false);
      setRating(0);
      setHoverRating(0);
      setReviewMsg("");
      setShowReviewForm(false);
      setSelectedRatingFilter("all");
      setReviewSort("recent");
      setActiveTab("details");
    }, 300);
  }

  function handleAddReview() {
    if (!user) {
      toast({
        title: "Authentication Required",
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
        title: "Critique Required",
        description: "Please share your commentary on sizing, cut, or fabric feel.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg.trim(),
        reviewValue: rating,
      })
    )
      .then((data) => {
        setIsSubmittingReview(false);
        if (data?.payload?.success) {
          setRating(0);
          setHoverRating(0);
          setReviewMsg("");
          setShowReviewForm(false);
          if (productDetails?._id) {
            dispatch(getReviews(productDetails._id));
          }
          toast({
            title: "Review Published",
            description: "Your review has been authenticated and published.",
          });
        } else {
          toast({
            title: "Review Submission Declined",
            description:
              data?.payload?.message ||
              data?.error?.message ||
              "Only verified purchasers of this item can submit a review.",
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        setIsSubmittingReview(false);
        toast({
          title: "Submission Error",
          description: err?.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      });
  }

  useEffect(() => {
    if (productDetails?._id) {
      dispatch(getReviews(productDetails._id));
    }
    if (productDetails?._id && user) {
      dispatch(checkProductInWishlist({ productId: productDetails._id })).then((data) => {
        setIsInWishlist(data.payload?.data?.isInWishlist || false);
      });
    } else {
      setIsInWishlist(false);
    }
  }, [productDetails, user, dispatch]);

  const averageReview = reviews?.length > 0
    ? reviews.reduce((sum, item) => sum + item.reviewValue, 0) / reviews.length
    : productDetails?.averageReview || 0;

  const totalReviewsCount = reviews?.length || 0;

  const ratingCounts = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews?.filter((r) => Math.round(r.reviewValue) === star).length || 0;
      const percentage =
        totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
      return { star, count, percentage };
    });
  }, [reviews, totalReviewsCount]);

  const recommendationRate = useMemo(() => {
    if (totalReviewsCount === 0) return 100;
    const positive = reviews?.filter((r) => r.reviewValue >= 4).length || 0;
    return Math.round((positive / totalReviewsCount) * 100);
  }, [reviews, totalReviewsCount]);

  const filteredReviews = useMemo(() => {
    return (reviews || [])
      .filter((r) => {
        if (selectedRatingFilter === "all") return true;
        return Math.round(r.reviewValue) === Number(selectedRatingFilter);
      })
      .sort((a, b) => {
        if (reviewSort === "highest") return b.reviewValue - a.reviewValue;
        if (reviewSort === "lowest") return a.reviewValue - b.reviewValue;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [reviews, selectedRatingFilter, reviewSort]);

  function getRatingLabel(score) {
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
        return "Select a rating";
    }
  }

  function formatReviewDate(dateString) {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recent";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const productImages = productDetails?.images || (productDetails?.image ? [productDetails.image] : []);
  const hasSale = productDetails?.salePrice > 0 && productDetails?.salePrice < productDetails?.price;
  const discountPercentage = hasSale ? Math.round(((productDetails.price - productDetails.salePrice) / productDetails.price) * 100) : 0;

  if (!productDetails) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] lg:h-[85vh] p-0 overflow-hidden bg-white border-none rounded-none flex flex-col sm:flex-row">
        
        {/* Left Side: Visual Archives */}
        <div className="w-full sm:w-1/2 lg:w-[55%] h-[400px] sm:h-full relative bg-[#fcfcfc] border-r border-zinc-100 flex flex-col">
           <div className="flex-1 relative overflow-hidden group">
             <AnimatePresence mode="wait">
               <motion.img
                 key={activeImage}
                 initial={{ opacity: 0, scale: 1.05 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.6, ease: "circOut" }}
                 src={productImages[activeImage]}
                 className="w-full h-full object-contain p-12 transition-transform duration-1000 group-hover:scale-105"
               />
             </AnimatePresence>
             
             {/* Architectural Badge */}
             <div className="absolute top-8 left-8 space-y-2">
                {hasSale && (
                  <div className="bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
                    SALE -{discountPercentage}%
                  </div>
                )}
                <div className="bg-white/50 backdrop-blur-md text-black/40 px-4 py-1 text-[10px] font-black uppercase tracking-[0.4em] border border-black/5">
                   Ref // {productDetails?._id.slice(-6).toUpperCase()}
                </div>
             </div>

             {/* Close Overlay */}
             <button onClick={handleDialogClose} className="absolute top-8 right-8 w-10 h-10 bg-white border border-zinc-100 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 shadow-sm z-50">
                <X className="w-4 h-4" />
             </button>
           </div>

           {/* Thumbnail Matrix */}
           <div className="h-24 border-t border-zinc-100 flex items-center px-8 gap-4 overflow-x-auto bg-white">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-12 h-12 flex-shrink-0 border transition-all duration-500 p-1 ${idx === activeImage ? "border-black scale-110" : "border-zinc-100 opacity-40 hover:opacity-100"}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
           </div>
        </div>

        {/* Right Side: Analytical Framework */}
        <div className="w-full sm:w-1/2 lg:w-[45%] h-full overflow-y-auto bg-white p-8 sm:p-12 space-y-12 scrollbar-none">
           <div>
              <div className="flex items-center gap-4 mb-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300">Section 01 // Overview</p>
                 <div className="h-[1px] flex-1 bg-zinc-50" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">{productDetails?.brand}</p>
              <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] text-black mb-6">
                {productDetails?.title}
              </h2>
              
              <div className="flex items-center gap-8 mb-8">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Price Pt.</p>
                    <div className="flex items-baseline gap-3">
                       <span className="text-3xl font-black tracking-tighter">₹{hasSale ? productDetails.salePrice : productDetails.price}</span>
                       {hasSale && <span className="text-sm text-zinc-300 line-through font-light italic">₹{productDetails.price}</span>}
                    </div>
                 </div>
                 <div className="h-10 w-[1px] bg-zinc-100" />
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Rating Avg.</p>
                    <div className="flex items-center gap-2">
                       <span className="text-xl font-black">{averageReview.toFixed(1)}</span>
                       <Star className="w-4 h-4 fill-black text-black" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Architectural Selectors */}
           <div className="space-y-8">
              {/* Color Selector */}
              {productDetails.colors?.length > 0 && (
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Section 02 // Color_Selection</p>
                   <div className="flex flex-wrap gap-2">
                     {productDetails.colors.map((color) => (
                       <button
                         key={color}
                         onClick={() => setSelectedColor((prev) => (prev === color ? "" : color))}
                         className={`h-10 min-w-[5rem] px-4 text-[10px] font-black uppercase tracking-widest transition-all border ${selectedColor === color ? "bg-black text-white border-black" : "bg-white text-zinc-300 border-zinc-100 hover:border-black hover:text-black"}`}
                       >
                         {color}
                       </button>
                     ))}
                   </div>
                </div>
              )}

              {/* Size Selector */}
              {productDetails?.sizes?.length > 0 && (
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Section 03 // Sizing</p>
                      <button className="text-[9px] font-black uppercase tracking-widest text-black border-b border-black/10 hover:border-black transition-all">Size Guide</button>
                   </div>
                   <div className="grid grid-cols-4 gap-2">
                      {productDetails.sizes.map((s) => (
                        <button
                          key={s.size}
                          disabled={s.stock === 0}
                          onClick={() => setSelectedSize((prev) => (prev === s.size ? "" : s.size))}
                          className={`py-3 text-[10px] font-black uppercase border transition-all duration-500 ${s.stock === 0 ? "bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed line-through" : selectedSize === s.size ? "bg-black text-white border-black" : "bg-white text-zinc-300 border-zinc-100 hover:border-zinc-400 hover:text-black"}`}
                        >
                          {s.size}
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {/* Quantity Analysis */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Section 04 // Inventory</p>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center border border-zinc-100 p-1">
                       <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 transition-colors text-black">-</button>
                       <span className="w-10 text-center text-xs font-black">{quantity}</span>
                       <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 transition-colors text-black">+</button>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {productDetails?.totalStock > 0 ? `${productDetails.totalStock} Available` : "Archived"}
                    </p>
                 </div>
              </div>

              {/* Primary Actions */}
              <div className="flex gap-4 pt-4">
                 <Button
                   size="xl"
                   onClick={handleAddToCart}
                   disabled={productDetails?.totalStock === 0}
                   className="flex-1 bg-black hover:bg-zinc-800 text-white rounded-none py-8 text-[10px] font-black tracking-[0.4em] uppercase transition-all duration-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] h-auto"
                 >
                   Archive to Cart
                 </Button>
                 <button 
                   onClick={handleToggleWishlist}
                   className={`w-16 flex items-center justify-center border transition-all duration-500 ${isInWishlist ? "bg-black border-black text-white" : "bg-white border-zinc-100 text-zinc-300 hover:border-black hover:text-black"}`}
                 >
                    <Heart className={`w-5 h-5 ${isInWishlist ? "fill-white" : ""}`} />
                 </button>
              </div>
           </div>

           {/* Auxiliary Data Tabs */}
           <div className="space-y-8 pt-8">
              <div className="flex items-center justify-between border-b border-zinc-100">
                 <div className="flex gap-8">
                    <button
                      key="details"
                      onClick={() => setActiveTab("details")}
                      className={`pb-4 text-[10px] font-black uppercase tracking-[0.4em] relative transition-all duration-300 ${activeTab === "details" ? "text-black" : "text-zinc-300 hover:text-zinc-600"}`}
                    >
                      DETAILS
                      {activeTab === "details" && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
                    </button>
                    <button
                      key="reviews"
                      onClick={() => setActiveTab("reviews")}
                      className={`pb-4 text-[10px] font-black uppercase tracking-[0.4em] relative transition-all duration-300 flex items-center gap-2 ${activeTab === "reviews" ? "text-black" : "text-zinc-300 hover:text-zinc-600"}`}
                    >
                      <span>REVIEWS</span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-mono tracking-normal border ${activeTab === "reviews" ? "bg-black text-white border-black" : "bg-zinc-50 text-zinc-400 border-zinc-200"}`}>
                        {totalReviewsCount}
                      </span>
                      {activeTab === "reviews" && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
                    </button>
                 </div>

                 {activeTab === "reviews" && !showReviewForm && (
                   <button
                     onClick={() => setShowReviewForm(true)}
                     className="pb-4 text-[9px] font-black uppercase tracking-[0.25em] text-black hover:text-zinc-500 transition-colors flex items-center gap-1.5"
                   >
                     <span>+ Write Review</span>
                   </button>
                 )}
              </div>

              <div className="min-h-[200px]">
                 <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                       {activeTab === "details" ? (
                         <div className="space-y-6">
                            <p className="text-[13px] text-zinc-500 leading-relaxed font-light italic">
                               "{productDetails?.description || "A masterfully crafted essential embodying contemporary minimalism and functional integrity."}"
                            </p>
                            <div className="grid grid-cols-2 gap-y-4 pt-2">
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Category</p>
                                  <p className="text-[11px] font-black uppercase text-black">{productDetails?.category}</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Sub-Category</p>
                                  <p className="text-[11px] font-black uppercase text-black">{productDetails?.subcategory}</p>
                               </div>
                            </div>
                         </div>
                       ) : (
                         <div className="space-y-8">
                            {/* Summary & Rating Distribution Matrix */}
                            <div className="bg-[#FAF9F6] border border-zinc-200/80 p-6 space-y-6">
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200/60">
                                  <div className="space-y-1.5">
                                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Composite Client Rating</p>
                                     <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black tracking-tight text-black">{averageReview.toFixed(1)}</span>
                                        <span className="text-xs font-semibold text-zinc-400">/ 5.0</span>
                                     </div>
                                     <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`w-3.5 h-3.5 ${
                                              star <= Math.round(averageReview)
                                                ? "fill-amber-400 text-amber-400"
                                                : "fill-zinc-200 text-zinc-200"
                                            }`}
                                          />
                                        ))}
                                        <span className="text-[10px] font-mono text-zinc-500 ml-2">
                                          ({totalReviewsCount} {totalReviewsCount === 1 ? "review" : "reviews"})
                                        </span>
                                     </div>
                                  </div>

                                  {totalReviewsCount > 0 && (
                                     <div className="sm:text-right space-y-1">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 text-[9px] font-black uppercase tracking-widest text-zinc-800">
                                           <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                           <span>{recommendationRate}% Recommendation</span>
                                        </div>
                                        <p className="text-[9px] text-zinc-400 tracking-wider">Verified Purchase Consensus</p>
                                     </div>
                                  )}
                               </div>

                               {/* Distribution Bars */}
                               <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Score Distribution</p>
                                     {selectedRatingFilter !== "all" && (
                                       <button
                                         onClick={() => setSelectedRatingFilter("all")}
                                         className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-black underline"
                                       >
                                         Reset Filter
                                       </button>
                                     )}
                                  </div>
                                  {ratingCounts.map(({ star, count, percentage }) => (
                                     <button
                                       key={star}
                                       type="button"
                                       onClick={() => setSelectedRatingFilter((prev) => (prev === star ? "all" : star))}
                                       className={`w-full group flex items-center gap-3 text-left py-1 px-2 -mx-2 rounded transition-colors ${
                                         selectedRatingFilter === star ? "bg-zinc-200/80" : "hover:bg-zinc-100"
                                       }`}
                                     >
                                        <span className="w-8 text-[10px] font-bold text-zinc-600 group-hover:text-black flex items-center gap-1">
                                           {star} <Star className="w-2.5 h-2.5 fill-zinc-400 text-zinc-400" />
                                        </span>
                                        <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                                           <div
                                             className={`h-full transition-all duration-500 ${
                                               selectedRatingFilter === star ? "bg-black" : "bg-zinc-700 group-hover:bg-black"
                                             }`}
                                             style={{ width: `${percentage}%` }}
                                           />
                                        </div>
                                        <span className="w-12 text-[10px] font-mono text-right text-zinc-400 group-hover:text-black">
                                           {count} ({percentage}%)
                                        </span>
                                     </button>
                                  ))}
                               </div>
                            </div>

                            {/* Review Form Drawer */}
                            <AnimatePresence>
                               {showReviewForm && (
                                 <motion.div
                                   initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                                   animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                                   exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                                   transition={{ duration: 0.3 }}
                                 >
                                    <div className="border border-black bg-white p-6 space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                       <div className="flex justify-between items-start">
                                          <div className="space-y-1">
                                             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Client Critique</span>
                                             <h4 className="text-sm font-black uppercase tracking-wider text-black">Write a Review</h4>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setShowReviewForm(false)}
                                            className="text-zinc-400 hover:text-black p-1 transition-colors"
                                          >
                                             <X className="w-4 h-4" />
                                          </button>
                                       </div>

                                       {!user ? (
                                         <div className="py-6 text-center space-y-3 bg-zinc-50 border border-zinc-200 p-4">
                                            <p className="text-xs text-zinc-600">
                                               Please sign in with your account to submit a client review.
                                            </p>
                                            <a
                                              href="/auth/login"
                                              className="inline-block px-5 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                                            >
                                               Sign In
                                            </a>
                                         </div>
                                       ) : (
                                         <div className="space-y-4">
                                            {/* Star Selection */}
                                            <div className="space-y-2">
                                               <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                                                  Select Evaluation (1 - 5 Stars) *
                                               </label>
                                               <div className="flex items-center gap-2 py-1">
                                                  {[1, 2, 3, 4, 5].map((s) => {
                                                    const active = s <= (hoverRating || rating);
                                                    return (
                                                      <button
                                                        key={s}
                                                        type="button"
                                                        onMouseEnter={() => setHoverRating(s)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setRating(s)}
                                                        className="p-1 -m-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                                      >
                                                         <Star
                                                           className={`w-6 h-6 transition-colors duration-200 ${
                                                             active
                                                               ? "fill-amber-400 text-amber-400"
                                                               : "fill-zinc-100 text-zinc-300"
                                                           }`}
                                                         />
                                                      </button>
                                                    );
                                                  })}
                                                  <span className="ml-3 text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                                                     {getRatingLabel(hoverRating || rating)}
                                                  </span>
                                               </div>
                                            </div>

                                            {/* Review Commentary */}
                                            <div className="space-y-1.5">
                                               <div className="flex justify-between items-center">
                                                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                     Your Impressions & Fit Notes *
                                                  </label>
                                                  <span className="text-[9px] font-mono text-zinc-400">
                                                     {reviewMsg.length} / 500
                                                  </span>
                                               </div>
                                               <textarea
                                                 value={reviewMsg}
                                                 maxLength={500}
                                                 onChange={(e) => setReviewMsg(e.target.value)}
                                                 placeholder="Critique garment cut, fabric feel, drape, and overall craftsmanship..."
                                                 className="w-full h-28 p-3 text-xs bg-[#FAF9F6] border border-zinc-200 rounded-none focus:outline-none focus:border-black focus:bg-white transition-colors resize-none placeholder:text-zinc-400 font-sans"
                                               />
                                            </div>

                                            <div className="pt-2 flex items-center justify-between gap-4">
                                               <button
                                                 type="button"
                                                 onClick={() => setShowReviewForm(false)}
                                                 className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-black border border-zinc-200 hover:border-black transition-colors"
                                               >
                                                  Cancel
                                               </button>
                                               <Button
                                                 type="button"
                                                 onClick={handleAddReview}
                                                 disabled={isSubmittingReview || rating === 0 || !reviewMsg.trim()}
                                                 className="flex-1 bg-black hover:bg-zinc-800 text-white rounded-none py-3 h-auto text-[9px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                               >
                                                  {isSubmittingReview ? (
                                                    <>
                                                       <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                       <span>Publishing...</span>
                                                    </>
                                                  ) : (
                                                    <span>Confirm & Publish Critique</span>
                                                  )}
                                               </Button>
                                            </div>
                                         </div>
                                       )}
                                    </div>
                                 </motion.div>
                               )}
                            </AnimatePresence>

                            {/* Filters & Sorting Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-b border-zinc-100 pb-4">
                               <div className="flex items-center gap-1.5 overflow-x-auto">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedRatingFilter("all")}
                                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider border transition-all ${
                                      selectedRatingFilter === "all"
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-zinc-400 border-zinc-200 hover:border-black hover:text-black"
                                    }`}
                                  >
                                     All ({totalReviewsCount})
                                  </button>
                                  {[5, 4, 3, 2, 1].map((s) => (
                                     <button
                                       key={s}
                                       type="button"
                                       onClick={() => setSelectedRatingFilter((prev) => (prev === s ? "all" : s))}
                                       className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border transition-all flex items-center gap-1 ${
                                         selectedRatingFilter === s
                                           ? "bg-black text-white border-black"
                                           : "bg-white text-zinc-400 border-zinc-200 hover:border-black hover:text-black"
                                       }`}
                                     >
                                        <span>{s}</span>
                                        <Star className="w-2.5 h-2.5 fill-current" />
                                     </button>
                                  ))}
                               </div>

                               <div className="flex items-center gap-2 text-[10px]">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Sort:</span>
                                  <select
                                    value={reviewSort}
                                    onChange={(e) => setReviewSort(e.target.value)}
                                    className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-black border-none focus:outline-none cursor-pointer"
                                  >
                                     <option value="recent">Newest</option>
                                     <option value="highest">Highest Rating</option>
                                     <option value="lowest">Lowest Rating</option>
                                  </select>
                               </div>
                            </div>

                            {/* Reviews Feed */}
                            <div className="space-y-6">
                               {filteredReviews && filteredReviews.length > 0 ? (
                                 filteredReviews.map((r, i) => (
                                   <div
                                     key={r._id || i}
                                     className="border-b border-zinc-100 pb-6 last:border-0 space-y-3"
                                   >
                                      <div className="flex justify-between items-start">
                                         <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-100 text-black">
                                               <AvatarFallback className="text-[11px] font-black">
                                                  {(r.userName || "U").charAt(0).toUpperCase()}
                                               </AvatarFallback>
                                            </Avatar>
                                            <div>
                                               <div className="flex items-center gap-2">
                                                  <span className="text-xs font-black uppercase tracking-wider text-black">
                                                     {r.userName || "Anonymous Client"}
                                                  </span>
                                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/50 text-[8px] font-black uppercase tracking-wider">
                                                     <Check className="w-2.5 h-2.5" /> Verified Buyer
                                                  </span>
                                               </div>
                                               <p className="text-[9px] font-mono text-zinc-400 mt-0.5">
                                                  {formatReviewDate(r.createdAt)}
                                               </p>
                                            </div>
                                         </div>

                                         <div className="flex items-center gap-0.5 text-amber-500">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                              <Star
                                                key={s}
                                                className={`w-3 h-3 ${
                                                  s <= r.reviewValue
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "fill-zinc-200 text-zinc-200"
                                                }`}
                                              />
                                            ))}
                                         </div>
                                      </div>

                                      <p className="text-xs text-zinc-600 font-normal leading-relaxed pl-11">
                                         "{r.reviewMessage}"
                                      </p>
                                   </div>
                                 ))
                               ) : (
                                 <div className="py-12 px-6 text-center bg-[#FAF9F6] border border-dashed border-zinc-200 space-y-4">
                                    <div className="w-10 h-10 mx-auto rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                                       <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                       <p className="text-xs font-black uppercase tracking-widest text-black">
                                          {selectedRatingFilter !== "all"
                                            ? `No ${selectedRatingFilter}-Star Reviews`
                                            : "No Client Reviews Yet"}
                                       </p>
                                       <p className="text-xs text-zinc-400 font-light max-w-xs mx-auto">
                                          {selectedRatingFilter !== "all"
                                            ? "There are currently no reviews with this specific rating."
                                            : "Be the first verified client to articulate fit, fabric, and silhouette critique."}
                                       </p>
                                    </div>
                                    {selectedRatingFilter !== "all" ? (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedRatingFilter("all")}
                                        className="text-[10px] font-black uppercase tracking-widest text-black underline underline-offset-4"
                                      >
                                         Clear Filter
                                      </button>
                                    ) : (
                                      !showReviewForm && (
                                        <button
                                          type="button"
                                          onClick={() => setShowReviewForm(true)}
                                          className="px-5 py-2.5 bg-black text-white text-[9px] font-black uppercase tracking-[0.25em] hover:bg-zinc-800 transition-colors"
                                        >
                                           Write First Review
                                        </button>
                                      )
                                    )}
                                 </div>
                               )}
                            </div>
                         </div>
                       )}
                    </motion.div>
                 </AnimatePresence>
              </div>
           </div>

           {/* Brand Affirmation */}
           <div className="pt-12 flex items-center gap-4 opacity-20 hover:opacity-100 transition-opacity duration-1000">
              <Sparkles className="w-5 h-5" />
              <p className="text-[9px] font-black uppercase tracking-[0.5em]">Certified Authentic Quality Anthology</p>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;

