import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingCart } from "lucide-react";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StarRatingComponent from "@/components/common/star-rating";

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

  const { reviews } = useSelector((state) => state.shopReview);
  const reviewRef = useRef(null);

  const handleScrollToReviews = () => {
    reviewRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(getReviews(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (productDetails?.images?.length > 0) {
      setSelectedImage(productDetails.images[0]);
    } else if (productDetails?.image) {
      setSelectedImage(productDetails.image);
    }
  }, [productDetails]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({ title: "Please login to add items to bag", variant: "destructive" });
      navigate("/auth/login");
      return;
    }

    if (!selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }

    if (productDetails?.colors?.length > 0 && !selectedColor) {
      toast({ title: "Please select a color", variant: "destructive" });
      return;
    }

    dispatch(addToCart({ 
      productId: id, 
      quantity: 1, 
      userId: user?.id, 
      selectedSize,
      selectedColor 
    })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Added to cart" });
      }
    });
  };

  const handleAddReview = () => {
    if (!isAuthenticated) {
      toast({ title: "Please login to add a review", variant: "destructive" });
      return;
    }

    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
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
        toast({ title: "Review added successfully!" });
      }
    });
  };

  if (isLoading) return <div className="container mx-auto p-8"><Skeleton className="h-[600px] w-full" /></div>;
  if (!productDetails) return <div className="container mx-auto p-8 text-center text-2xl">Product not found</div>;

  const allImages = productDetails.images?.length > 0 ? productDetails.images : [productDetails.image];

  return (
    <div className="container mx-auto px-4 py-12 bg-white min-h-screen">
      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
        {/* Product Images */}
        <div className="space-y-6">
          <div className="aspect-[3/4] overflow-hidden rounded-none border-2 border-black bg-zinc-50 flex items-center justify-center p-4">
            <img
              src={selectedImage}
              alt={productDetails.title}
              className="w-full h-full object-contain transition-all duration-700"
            />
          </div>
          
          {/* Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
              {allImages.map((img, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square cursor-pointer border-2 transition-all duration-300 p-1 bg-white ${
                    selectedImage === img ? "border-black scale-105" : "border-zinc-100 hover:border-zinc-300"
                  }`}
                >
                  <img src={img} alt={`view-${index}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">{productDetails.brand}</p>
            <h1 className="text-5xl font-black tracking-tight text-black uppercase mb-4 leading-none">{productDetails.title}</h1>
            
            <div className="flex items-center gap-6 mt-6">
               <div className="flex items-center bg-black text-white px-4 py-1.5 text-[11px] font-black tracking-widest uppercase">
                {productDetails.averageReview?.toFixed(1) || "5.0"}
                <Star className="w-3.5 h-3.5 fill-white ml-2.5" />
              </div>
              <span className="text-zinc-200">/</span>
              <span 
                onClick={handleScrollToReviews}
                className="text-[11px] font-black uppercase tracking-widest text-zinc-400 border-b-2 border-zinc-100 cursor-pointer hover:text-black hover:border-black transition-all"
              >
                {productDetails.reviewCount || 0} Authenticated Reviews
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-6 border-y border-zinc-100 py-10">
            <span className="text-5xl font-black text-black tracking-tighter">
              ₹{productDetails.salePrice > 0 ? productDetails.salePrice : productDetails.price}
            </span>
            {productDetails.salePrice > 0 && (
              <span className="text-2xl text-zinc-300 line-through font-light italic">₹{productDetails.price}</span>
            )}
          </div>

          {/* Color Selection */}
          {productDetails.colors?.length > 0 && (
            <div className="space-y-6">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Available Palette</h3>
               <div className="flex flex-wrap gap-4">
                  {productDetails.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-14 min-w-[3.5rem] px-6 border-2 transition-all duration-300 text-[11px] font-bold tracking-widest uppercase ${
                        selectedColor === color
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-zinc-200 hover:border-black"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
               </div>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Size Architecture</h3>
            <div className="flex flex-wrap gap-4">
              {productDetails.sizes?.map((sizeItem) => (
                <button
                  key={sizeItem.size}
                  onClick={() => setSelectedSize(sizeItem.size)}
                  className={`h-14 min-w-[4.5rem] px-6 border-2 transition-all duration-300 text-[11px] font-bold tracking-widest uppercase ${
                    selectedSize === sizeItem.size
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-zinc-200 hover:border-black"
                  }`}
                >
                  {sizeItem.size}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-10">
            <Button
              onClick={handleAddToCart}
              className="w-full bg-black hover:bg-zinc-800 text-white rounded-none h-20 text-sm font-black tracking-[0.4em] uppercase transition-all duration-500 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,0.1)]"
            >
              <ShoppingCart className="mr-6 w-6 h-6 stroke-[2.5]" /> Purchase Asset
            </Button>
          </div>

          <div className="pt-12">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 underline underline-offset-8 decoration-zinc-100">Product Manifesto</h3>
            <p className="text-zinc-600 leading-[2] font-light text-xl italic pr-12">
              "{productDetails.description || "A premium offering crafted with the finest materials for unparalleled style and comfort."}"
            </p>
          </div>
        </div>
      </div>

      {/* Review Section - FULL WIDTH OUTSIDE THE GRID */}
      <div 
        ref={reviewRef}
        className="border-t-2 border-black pt-24 space-y-24"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-zinc-100 pb-16">
          <div className="space-y-6 w-full text-center md:text-left">
            <h2 className="text-6xl font-black uppercase tracking-tighter text-black">Customer Reviews</h2>
            <div className="flex items-center justify-center md:justify-start gap-8">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-7 h-7 ${star <= Math.floor(productDetails.averageReview || 5) ? 'fill-black' : 'fill-zinc-100 text-zinc-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-black uppercase tracking-[0.5em] text-zinc-300">
                Based on {reviews?.length || 0} Assets Verification
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-24">
          {/* Add Review Form */}
          <div className="bg-white border border-zinc-200 p-8 sm:p-20 space-y-12 w-full">
            <div className="text-center md:text-left">
              <h3 className="text-4xl font-bold tracking-tight text-black mb-2 italic underline underline-offset-[16px] decoration-1 decoration-zinc-200">Share Your Testimony</h3>
              <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-[0.4em] mt-10">Your aesthetic validation helps the community architect better choices</p>
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                 <label className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">Step 01 / Rating Assessment</label>
                 <div className="flex bg-zinc-50 py-12 border border-zinc-100 items-center justify-center">
                  <StarRatingComponent rating={rating} handleRatingChange={(val) => setRating(val)} />
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-end">
                  <label className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">Step 02 / Critical Testimony</label>
                  <span className="text-xs text-zinc-300 font-mono tracking-widest">{reviewMsg.length} / 500</span>
                 </div>
                 <textarea 
                  value={reviewMsg}
                  onChange={(e) => setReviewMsg(e.target.value.slice(0, 500))}
                  placeholder="Detail your experience with this asset..."
                  className="w-full h-56 bg-zinc-50 border border-transparent p-8 text-lg font-light text-black focus:bg-white focus:border-zinc-200 outline-none transition-all duration-500 resize-none placeholder:text-zinc-300 custom-scrollbar leading-relaxed"
                 />
              </div>

              <Button 
                onClick={handleAddReview}
                disabled={!reviewMsg.trim() || rating === 0}
                className="w-full bg-black hover:bg-zinc-800 text-white rounded-none h-20 text-sm font-black tracking-[0.4em] uppercase transition-all duration-500 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.05)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)]"
              >
                Authenticate Submission
              </Button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-16">
            <div className="border-b-4 border-black pb-8">
              <h3 className="text-3xl font-black uppercase tracking-tight text-black">Verified Testimonies ({reviews?.length || 0})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-h-[1200px] overflow-y-auto pr-6 custom-scrollbar">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem, index) => (
                  <div key={index} className="space-y-6 border border-zinc-100 p-10 bg-white hover:border-black transition-all duration-700 group hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 rounded-none border border-zinc-100 group-hover:border-black transition-colors duration-500">
                          <AvatarFallback className="bg-white text-black text-sm font-black uppercase">
                            {reviewItem?.userName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em]">{reviewItem?.userName}</p>
                          <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-4 h-4 ${star <= reviewItem.reviewValue ? 'fill-black' : 'fill-zinc-100 text-zinc-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-zinc-500 font-light text-lg leading-[1.8] italic border-l-4 border-zinc-50 pl-6 group-hover:border-black transition-all duration-500">
                      "{reviewItem.reviewMessage}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full h-64 flex items-center justify-center border-4 border-dashed border-zinc-50">
                  <p className="text-sm font-black uppercase tracking-[0.4em] text-zinc-200">Null Reviews Detected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingProductDetails;
