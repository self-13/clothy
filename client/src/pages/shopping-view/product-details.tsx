import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Heart, Plus, Minus, ChevronRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
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
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);

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

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Login",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    if (!selectedSize) {
      toast({
        title: "Selection Required",
        description: "Please select a size first",
        variant: "destructive",
      });
      return;
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
        if (user?.id) dispatch(fetchCartItems(user.id) as any);
        toast({ title: "Success", description: "Product added to cart" });
      }
    });
  };

  const handleAddReview = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addReview({
        productId: id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      }) as any
    ).then((data: any) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        if (id) dispatch(getReviews(id) as any);
        toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      }
    });
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast({ title: "Login Required", variant: "destructive" });
      navigate("/auth/login");
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist({ productId: id }) as any).then((data: any) => {
        if (data?.payload?.success) {
          setIsInWishlist(false);
          toast({ title: "Removed from Wishlist" });
        }
      });
    } else {
      dispatch(addToWishlist({ productId: id }) as any).then((data: any) => {
        if (data?.payload?.success) {
          setIsInWishlist(true);
          toast({ title: "Added to Wishlist" });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!productDetails) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Product not found</p>
      </div>
    );
  }

  const allImages = productDetails.images?.length > 0 ? productDetails.images : [productDetails.image];
  const hasSale = productDetails.salePrice > 0 && productDetails.salePrice < productDetails.price;

  return (
    <div className="bg-white min-h-screen font-spaceGrotesk pt-20">
      
      {/* Breadcrumb */}
      <div className="border-b border-zinc-100 bg-zinc-50/50">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
          <span className="hover:text-black cursor-pointer" onClick={() => navigate("/")}>
            Home
          </span>
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          <span className="hover:text-black cursor-pointer" onClick={() => navigate("/shop/listing")}>
            {productDetails.category}
          </span>
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          <span className="text-black font-extrabold">{productDetails.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Side: Images (Grid span 5) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="aspect-[4/5] bg-[#f6f6f6] rounded-2xl relative overflow-hidden flex items-center justify-center p-8 border border-zinc-100 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={selectedImage}
                  alt={productDetails.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-contain"
                />
              </AnimatePresence>

              {/* Sale badge */}
              {hasSale && (
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  Sale -₹{productDetails.price - productDetails.salePrice}
                </div>
              )}

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full shadow-sm flex items-center justify-center border transition-all duration-300 ${
                  isInWishlist
                    ? "bg-black text-white border-black"
                    : "bg-white text-zinc-400 border-zinc-200 hover:text-black"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Image Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 flex-shrink-0 border-2 rounded-lg transition-all p-1.5 bg-[#f6f6f6] ${
                    selectedImage === img ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} className="w-full h-full object-contain" alt="thumb" />
                </button>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-100">
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-5 h-5 text-black" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  100% Authentic
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-5 h-5 text-black" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  Fast Delivery
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-5 h-5 text-black" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  10-Day Returns
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Details (Grid span 6) */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            
            {/* Header info */}
            <div className="space-y-3 mb-6">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-full border border-zinc-150 inline-block">
                {productDetails.brand}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-black">
                {productDetails.title}
              </h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-[#f6f6f6] px-2 py-0.5 rounded border border-zinc-200">
                  <span className="text-xs font-bold text-black">
                    {productDetails.averageReview?.toFixed(1) || "5.0"}
                  </span>
                  <Star className="w-3 h-3 fill-black text-black" />
                </div>
                <span className="text-zinc-200">|</span>
                <button
                  onClick={handleScrollToReviews}
                  className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black underline underline-offset-4"
                >
                  {reviews?.length || 0} Customer Reviews
                </button>
              </div>
            </div>

            {/* Price section */}
            <div className="mb-8 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-black">
                ₹{hasSale ? productDetails.salePrice : productDetails.price}
              </span>
              {hasSale && (
                <span className="text-lg text-zinc-300 line-through">₹{productDetails.price}</span>
              )}
              {productDetails.totalStock > 0 ? (
                <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-0.5 ml-auto uppercase tracking-wide">
                  In Stock
                </span>
              ) : (
                <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 rounded-full px-3 py-0.5 ml-auto uppercase tracking-wide">
                  Out of Stock
                </span>
              )}
            </div>

            <Separator className="mb-8" />

            {/* Selection details */}
            <div className="space-y-8 mb-8">
              
              {/* Color list */}
              {productDetails.colors?.length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {productDetails.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`h-9 px-4 rounded-full text-xs font-bold uppercase tracking-wide border transition-all duration-300 ${
                          selectedColor === color
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-white text-zinc-400 border-zinc-200 hover:border-black hover:text-black"
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
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      Size
                    </label>
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest cursor-pointer hover:text-black transition-colors">
                      Size Guide
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {productDetails.sizes.map((s: { size: string; stock: number }) => (
                      <button
                        key={s.size}
                        onClick={() => setSelectedSize(s.size)}
                        className={`w-12 h-12 rounded-full text-xs font-bold uppercase border transition-all duration-300 ${
                          selectedSize === s.size
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-white text-zinc-400 border-zinc-200 hover:border-black hover:text-black"
                        }`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector & Add button */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Quantity
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-zinc-200 rounded-full h-12 bg-white overflow-hidden w-full sm:w-36">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-full flex items-center justify-center hover:bg-zinc-50 border-r border-zinc-100 text-black transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center text-xs font-bold text-black">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-full flex items-center justify-center hover:bg-zinc-50 border-l border-zinc-100 text-black transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={productDetails.totalStock === 0}
                    className="w-full sm:flex-1 h-12 bg-black hover:bg-zinc-800 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {productDetails.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>

            <Separator className="mb-8" />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black">
                Product Details
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-light">
                {productDetails.description}
              </p>
            </div>
          </div>
        </div>

        {/* Customer reviews section */}
        <div ref={reviewRef} className="mt-24 pt-16 border-t border-zinc-100">
          <div className="max-w-4xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-black">
                Customer Reviews
              </h2>
              <div className="flex items-center gap-4 bg-[#f8f8f8] px-5 py-2.5 rounded-xl border border-zinc-200">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.floor(productDetails.averageReview || 5)
                          ? "fill-black text-black"
                          : "fill-zinc-100 text-zinc-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Average {productDetails.averageReview?.toFixed(1) || "5.0"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Form to submit review */}
              <div className="space-y-6">
                <div className="p-6 md:p-8 bg-[#f8f8f8] border border-zinc-200 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold uppercase mb-1">Write a Review</h3>
                  <p className="text-xs text-zinc-500 mb-6">Share your rating and feedback details.</p>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        Rating
                      </label>
                      <div className="flex justify-center py-3 bg-white border border-zinc-200 rounded-xl">
                        <StarRatingComponent
                          rating={rating}
                          handleRatingChange={(val) => setRating(val)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        Review Message
                      </label>
                      <textarea
                        value={reviewMsg}
                        onChange={(e) => setReviewMsg(e.target.value)}
                        placeholder="How was the fit and material?"
                        className="w-full h-32 bg-white border border-zinc-250 p-4 rounded-xl text-sm font-light focus:border-black outline-none transition-all resize-none placeholder:text-zinc-300"
                      />
                    </div>

                    <button
                      onClick={handleAddReview}
                      disabled={rating === 0 || !reviewMsg.trim()}
                      className="w-full h-12 bg-black text-white hover:bg-zinc-800 transition-all rounded-full font-bold uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>

              {/* Reviews list */}
              <div className="space-y-8">
                {reviews && reviews.length > 0 ? (
                  reviews.map((item: any, idx: number) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      key={idx}
                      className="space-y-3 pb-6 border-b border-zinc-100 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 border border-zinc-200">
                            <AvatarFallback className="bg-zinc-100 text-black font-bold uppercase text-[9px]">
                              {item.userName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold uppercase tracking-wider">{item.userName}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= item.reviewValue ? "fill-black text-black" : "fill-zinc-150 text-zinc-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-500 font-light text-xs italic leading-relaxed pl-11">
                        "{item.reviewMessage}"
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl bg-[#f8f8f8]">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      No Reviews Yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
