import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { resetProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import { useEffect, useState, useCallback } from "react";
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
  Sparkles,
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

  function handleAddToCart() {
    if (!selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    const sizeStock = productDetails?.sizes?.find((s) => s.size === selectedSize);
    if (!sizeStock || sizeStock.stock < quantity) {
      toast({ title: `Only ${sizeStock?.stock || 0} items available`, variant: "destructive" });
      return;
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
        dispatch(fetchCartItems());
        toast({ title: "Success", description: "Asset archived in your cart." });
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
      setQuantity(1);
      setActiveImage(0);
      setIsInWishlist(false);
    }, 300);
  }

  function handleAddReview() {
    if (!user) return;
    dispatch(
      addReview({
        productId: productDetails?._id,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({ title: "Transmission Successful", description: "Review authenticated and live." });
      }
    });
  }

  useEffect(() => {
    if (productDetails && user) {
      dispatch(getReviews(productDetails?._id));
      dispatch(checkProductInWishlist({ productId: productDetails?._id })).then((data) => {
        setIsInWishlist(data.payload?.data?.isInWishlist || false);
      });
    }
  }, [productDetails, user, dispatch]);

  const averageReview = reviews?.length > 0
    ? reviews.reduce((sum, item) => sum + item.reviewValue, 0) / reviews.length
    : productDetails?.averageReview || 0;

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
                         onClick={() => setSelectedColor(color)}
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
                          onClick={() => setSelectedSize(s.size)}
                          className={`py-3 text-[10px] font-black uppercase border transition-all duration-500 ${selectedSize === s.size ? "bg-black text-white border-black" : "bg-white text-zinc-300 border-zinc-100 hover:border-zinc-400 hover:text-black"}`}
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
              <div className="flex gap-8 border-b border-zinc-50">
                 {["DETAILS", "REVIEWS"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={`pb-4 text-[10px] font-black uppercase tracking-[0.4em] relative transition-all duration-500 ${activeTab === tab.toLowerCase() ? "text-black" : "text-zinc-200 hover:text-zinc-400"}`}
                    >
                      {tab}
                      {activeTab === tab.toLowerCase() && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
                    </button>
                 ))}
              </div>

              <div className="min-h-[200px]">
                 <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                    >
                       {activeTab === "details" ? (
                         <div className="space-y-6">
                            <p className="text-[13px] text-zinc-500 leading-relaxed font-light lowercase italic">
                               "{productDetails?.description || "A masterfully crafted essential embodying contemporary minimalism and functional integrity."}"
                            </p>
                            <div className="grid grid-cols-2 gap-y-4">
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Category</p>
                                  <p className="text-[11px] font-black uppercase">{productDetails?.category}</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Sub-Category</p>
                                  <p className="text-[11px] font-black uppercase">{productDetails?.subcategory}</p>
                               </div>
                            </div>
                         </div>
                       ) : (
                         <div className="space-y-8">
                            {/* Review Form */}
                            <div className="space-y-4 bg-zinc-50 p-6">
                               <p className="text-[10px] font-black uppercase tracking-widest">Transmit Review</p>
                               <div className="flex gap-1">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} onClick={() => setRating(s)} className={`w-4 h-4 cursor-pointer ${s <= rating ? "fill-black text-black" : "fill-zinc-200 text-zinc-200"}`} />
                                  ))}
                               </div>
                               <Input 
                                 value={reviewMsg} 
                                 onChange={(e) => setReviewMsg(e.target.value)}
                                 className="rounded-none border-zinc-200 py-6 text-xs bg-white" 
                                 placeholder="Enter analytical feedback..." 
                               />
                               <Button onClick={handleAddReview} className="bg-black text-white text-[9px] uppercase tracking-[0.3em] font-black rounded-none">Confirm Submission</Button>
                            </div>

                            {/* Review List */}
                            <div className="space-y-6">
                               {reviews?.map((r, i) => (
                                 <div key={i} className="border-b border-zinc-50 pb-6 last:border-0">
                                    <div className="flex justify-between items-start mb-2">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-black underline underline-offset-4 decoration-zinc-100">{r.userName}</span>
                                       <div className="flex gap-0.5">
                                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-2.5 h-2.5 ${s <= r.reviewValue ? "fill-black text-black" : "fill-zinc-100 text-zinc-100"}`} />)}
                                       </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 font-light lowercase">"{r.reviewMessage}"</p>
                                 </div>
                               ))}
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

