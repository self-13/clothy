import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingCart, Heart, Plus, Minus, ChevronRight, ShieldCheck, Truck, RotateCcw, Check, Share2 } from "lucide-react";
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

function ShoppingProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { productDetails, isLoading } = useSelector((state) => state.shopProducts);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { reviews } = useSelector((state) => state.shopReview);
  const reviewRef = useRef(null);

  const handleScrollToReviews = () => {
    reviewRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(getReviews(id));

      if (isAuthenticated) {
        dispatch(checkProductInWishlist({ productId: id })).then((data) => {
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
      toast({ title: "Please Login", description: "You need to be logged in to add items to cart", variant: "destructive" });
      navigate("/auth/login");
      return;
    }

    if (!selectedSize) {
      toast({ title: "Selection Required", description: "Please select a size first", variant: "destructive" });
      return;
    }

    dispatch(addToCart({ 
      productId: id, 
      quantity: quantity, 
      userId: user?.id, 
      selectedSize,
      selectedColor 
    })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Success", description: "Product added to cart" });
      }
    });
  };

  const handleAddReview = () => {
    if (!isAuthenticated) {
      toast({ title: "Login Required", description: "Please login to submit a review", variant: "destructive" });
      return;
    }

    if (rating === 0) {
      toast({ title: "Rating Required", description: "Please provide a rating", variant: "destructive" });
      return;
    }

    dispatch(addReview({
      productId: id,
      userId: user?.id,
      userName: user?.userName,
      reviewMessage: reviewMsg,
      reviewValue: rating
    })).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(id));
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
      dispatch(removeFromWishlist({ productId: id })).then((data) => {
        if (data?.payload?.success) {
          setIsInWishlist(false);
          toast({ title: "Removed from Wishlist" });
        }
      });
    } else {
      dispatch(addToWishlist({ productId: id })).then((data) => {
        if (data?.payload?.success) {
          setIsInWishlist(true);
          toast({ title: "Added to Wishlist" });
        }
      });
    }
  };

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;
  if (!productDetails) return <div className="h-screen w-full flex items-center justify-center bg-white"><p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Product not found</p></div>;

  const allImages = productDetails.images?.length > 0 ? productDetails.images : [productDetails.image];
  const hasSale = productDetails.salePrice > 0 && productDetails.salePrice < productDetails.price;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-zinc-100">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-[11px] font-medium text-zinc-400 uppercase tracking-widest">
           <span className="hover:text-black cursor-pointer" onClick={() => navigate("/")}>Home</span>
           <ChevronRight className="w-3 h-3" />
           <span className="hover:text-black cursor-pointer" onClick={() => navigate("/shop/listing")}>{productDetails.category}</span>
           <ChevronRight className="w-3 h-3" />
           <span className="text-black font-bold">{productDetails.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left Side: Visuals */}
          <div className="space-y-6">
            <div className="aspect-[4/5] bg-[#f9f9f9] relative overflow-hidden group shadow-sm border border-zinc-50">
               <AnimatePresence mode="wait">
                 <motion.img
                   key={selectedImage}
                   src={selectedImage}
                   alt={productDetails.title}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.5 }}
                   className="w-full h-full object-contain p-8 mix-blend-multiply"
                 />
               </AnimatePresence>
               
               {/* Sale Badge */}
               {hasSale && (
                 <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1 text-[10px] font-black tracking-widest uppercase">
                   Save ₹{productDetails.price - productDetails.salePrice}
                 </div>
               )}

               {/* Wishlist Button - Restored to floating style */}
               <button 
                 onClick={handleToggleWishlist}
                 className={`absolute top-6 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isInWishlist ? 'bg-black text-white' : 'bg-white text-zinc-400 hover:text-black'}`}
               >
                 <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
               </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 flex-shrink-0 border-2 transition-all p-2 bg-[#f9f9f9] ${selectedImage === img ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt="thumb" />
                </button>
              ))}
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-100">
               <div className="flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-zinc-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">100% Authentic</span>
               </div>
               <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="w-5 h-5 text-zinc-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Fast Shipping</span>
               </div>
               <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw className="w-5 h-5 text-zinc-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">30 Day Return</span>
               </div>
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="flex flex-col">
            <div className="space-y-2 mb-6">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.3em]">{productDetails.brand}</p>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-black">{productDetails.title}</h1>
            </div>

            <div className="flex items-center gap-4 mb-8">
               <div className="flex items-center gap-1 bg-zinc-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-bold">{productDetails.averageReview?.toFixed(1) || "5.0"}</span>
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
               </div>
               <span className="text-zinc-300">|</span>
               <button onClick={handleScrollToReviews} className="text-sm font-medium text-zinc-500 hover:text-black underline underline-offset-4">
                 {reviews?.length || 0} Reviews
               </button>
            </div>

            <div className="mb-10 flex items-baseline gap-4">
              <span className="text-4xl font-bold text-black">₹{hasSale ? productDetails.salePrice : productDetails.price}</span>
              {hasSale && <span className="text-xl text-zinc-300 line-through">₹{productDetails.price}</span>}
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 ml-auto uppercase tracking-widest">In Stock</span>
            </div>

            <Separator className="mb-10" />

            {/* Selection Area */}
            <div className="space-y-10 mb-12">
               {/* Color Selection */}
               {productDetails.colors?.length > 0 && (
                 <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Available Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {productDetails.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`h-12 min-w-[5rem] px-6 text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedColor === color ? "bg-black text-white border-black shadow-lg" : "bg-white text-zinc-400 border-zinc-200 hover:border-black hover:text-black"}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                 </div>
               )}

               {/* Size Selection */}
               {productDetails.sizes?.length > 0 && (
                 <div className="space-y-4">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Select Size</label>
                      <button className="text-[10px] font-bold text-zinc-300 hover:text-black underline uppercase tracking-widest">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {productDetails.sizes.map((s) => (
                         <button
                           key={s.size}
                           onClick={() => setSelectedSize(s.size)}
                           className={`h-12 min-w-[4rem] px-4 text-xs font-bold transition-all border ${selectedSize === s.size ? "bg-black text-white border-black" : "bg-white text-zinc-400 border-zinc-200 hover:border-black hover:text-black"}`}
                         >
                           {s.size}
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {/* Quantity & Action */}
               <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Quantity</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center border border-zinc-200 h-14 bg-white">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-full flex items-center justify-center hover:bg-zinc-50 border-r border-zinc-100 transition-colors text-black"><Minus className="w-4 h-4" /></button>
                      <span className="w-16 text-center text-sm font-bold">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-full flex items-center justify-center hover:bg-zinc-50 border-l border-zinc-100 transition-colors text-black"><Plus className="w-4 h-4" /></button>
                    </div>
                    
                    <Button
                      onClick={handleAddToCart}
                      disabled={productDetails.totalStock === 0}
                      className="flex-1 h-14 bg-black hover:bg-zinc-800 text-white rounded-none font-bold uppercase tracking-widest transition-all"
                    >
                      <ShoppingCart className="w-5 h-5 mr-3" />
                      {productDetails.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </div>
               </div>
            </div>

            <Separator className="mb-10" />

            {/* Description */}
            <div className="space-y-4 mb-12">
               <h3 className="text-xs font-bold uppercase tracking-widest text-black">Product Details</h3>
               <p className="text-zinc-600 leading-relaxed font-light text-lg">
                 {productDetails.description}
               </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div ref={reviewRef} className="mt-32 pt-24 border-t border-zinc-100">
          <div className="max-w-4xl mx-auto">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20">
                <h2 className="text-4xl font-bold tracking-tight text-black">Customer Reviews</h2>
                <div className="flex items-center gap-4 bg-zinc-50 px-6 py-3 border border-zinc-100">
                   <div className="flex gap-0.5">
                     {[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= Math.floor(productDetails.averageReview || 5) ? 'fill-black' : 'fill-zinc-100 text-zinc-200'}`} />)}
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest">Average {productDetails.averageReview?.toFixed(1) || "5.0"}</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* Write Review */}
                <div className="space-y-8">
                   <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-lg">
                      <h3 className="text-xl font-bold mb-2">Write a Review</h3>
                      <p className="text-sm text-zinc-500 mb-8">Share your thoughts with the community.</p>
                      
                      <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Your Rating</label>
                           <div className="flex justify-center py-4 bg-white border border-zinc-100">
                             <StarRatingComponent rating={rating} handleRatingChange={(val) => setRating(val)} />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Your Testimony</label>
                           <textarea 
                             value={reviewMsg}
                             onChange={(e) => setReviewMsg(e.target.value)}
                             placeholder="How was the fit, material, and experience?"
                             className="w-full h-40 bg-white border border-zinc-100 p-4 text-sm font-light text-black focus:border-black outline-none transition-all resize-none placeholder:text-zinc-200"
                           />
                        </div>

                        <Button 
                          onClick={handleAddReview}
                          disabled={rating === 0 || !reviewMsg.trim()}
                          className="w-full h-14 bg-black text-white hover:bg-zinc-800 transition-all rounded-none font-bold uppercase tracking-widest"
                        >
                          Submit Review
                        </Button>
                      </div>
                   </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-12">
                   {reviews && reviews.length > 0 ? (
                    reviews.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={idx} 
                        className="space-y-4 pb-8 border-b border-zinc-50 last:border-0"
                      >
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <Avatar className="w-10 h-10 border border-zinc-100">
                                 <AvatarFallback className="bg-zinc-50 text-black font-bold uppercase text-[10px]">
                                   {item.userName?.[0]}
                                 </AvatarFallback>
                               </Avatar>
                               <span className="text-xs font-bold uppercase tracking-widest">{item.userName}</span>
                            </div>
                            <div className="flex gap-0.5">
                               {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3 h-3 ${s <= item.reviewValue ? 'fill-black' : 'fill-zinc-100 text-zinc-200'}`} />)}
                            </div>
                         </div>
                         <p className="text-zinc-500 font-light text-sm italic leading-relaxed">
                           "{item.reviewMessage}"
                         </p>
                      </motion.div>
                    ))
                   ) : (
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-50 rounded-lg">
                       <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">No reviews yet</p>
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

export default ShoppingProductDetails;
