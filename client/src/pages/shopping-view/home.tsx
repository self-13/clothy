import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon, Plus, ArrowRight, ShieldCheck, Truck, RefreshCw, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllFilteredProducts, resetProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { getFeatureImages } from "@/store/common-slice";
import { useToast } from "@/components/ui/use-toast";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import Footer from "@/components/shopping-view/footer";

export default function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [genderView, setGenderView] = useState(() => {
    const savedGender = localStorage.getItem("selectedGender");
    if (savedGender === "man") return "MEN";
    if (savedGender === "woman") return "WOMEN";
    return "MEN";
  });
  
  const [activeCategoryTab, setActiveCategoryTab] = useState("All");

  const { productList } = useSelector((state: any) => state.shopProducts);
  const { featureImageList } = useSelector((state: any) => state.commonFeature);
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGenderViewChange = (newGender: "MEN" | "WOMEN") => {
    const storageGender = newGender === "MEN" ? "man" : "woman";
    localStorage.setItem("selectedGender", storageGender);
    setGenderView(newGender);
  };

  const handleAddtoCart = (productId: string, size = "M") => {
    dispatch(
      addToCart({ productId, quantity: 1, selectedSize: size }) as any
    ).then((data: any) => {
      if (data?.payload?.success) {
        if (user?.id) dispatch(fetchCartItems(user.id) as any);
        toast({ title: "Product added to cart successfully!" });
      }
    });
  };

  // Carousel controls
  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === featureImageList.length - 1 ? 0 : prev + 1));
  }, [featureImageList.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? featureImageList.length - 1 : prev - 1));
  }, [featureImageList.length]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: { isActive: true },
        sortParams: "most-selling",
      }) as any
    );
    dispatch(getFeatureImages() as any);
    dispatch(resetProductDetails() as any);
  }, [dispatch]);

  useEffect(() => {
    if (featureImageList.length <= 1) return;
    const timer = setInterval(() => goToNextSlide(), 5000);
    return () => clearInterval(timer);
  }, [featureImageList.length, goToNextSlide]);

  // Derived product categories
  const menProducts = useMemo(() => {
    if (!productList) return [];
    return productList
      .filter(
        (p: any) =>
          p.category === "men" ||
          p.category === "man" ||
          p.gender === "men" ||
          p.gender === "man"
      )
      .slice(0, 4);
  }, [productList]);

  const womenProducts = useMemo(() => {
    if (!productList) return [];
    return productList
      .filter(
        (p: any) =>
          p.category === "women" ||
          p.category === "woman" ||
          p.gender === "women" ||
          p.gender === "woman"
      )
      .slice(0, 4);
  }, [productList]);

  const featuredProducts = useMemo(() => {
    if (!productList) return [];
    const isMen = genderView.toUpperCase() === "MEN";
    return productList
      .filter((p: any) => {
        if (!p.isFeatured) return false;
        const cat = p.category?.toLowerCase();
        const gen = p.gender?.toLowerCase();
        if (isMen) {
          return cat === "men" || cat === "man" || gen === "men" || gen === "man";
        } else {
          return cat === "women" || cat === "woman" || gen === "women" || gen === "woman";
        }
      })
      .slice(0, 4);
  }, [productList, genderView]);

  const hotCollections = useMemo(() => {
    if (!productList) return [];
    return productList.slice(0, 4);
  }, [productList]);

  // Filter products by tab selection
  const tabFilteredProducts = useMemo(() => {
    if (!productList) return [];
    const isMen = genderView.toUpperCase() === "MEN";
    let filtered = productList.filter((p: any) => {
      const cat = p.category?.toLowerCase();
      const gen = p.gender?.toLowerCase();
      if (isMen) {
        return cat === "men" || cat === "man" || gen === "men" || gen === "man";
      } else {
        return cat === "women" || cat === "woman" || gen === "women" || gen === "woman";
      }
    });

    if (activeCategoryTab !== "All") {
      filtered = filtered.filter(
        (p: any) =>
          p.subcategory?.toLowerCase() === activeCategoryTab.toLowerCase()
      );
    }
    return filtered.slice(0, 4);
  }, [productList, genderView, activeCategoryTab]);

  return (
    <div className="flex flex-col min-h-screen bg-white font-spaceGrotesk pt-20">
      
      {/* 1. Banner Section (Hero) */}
      <section className="relative w-full h-[85vh] overflow-hidden bg-zinc-950 flex flex-col justify-end text-white">
        {featureImageList && featureImageList.length > 0 ? (
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={featureImageList[currentSlide]?.image}
                alt="Banner slide"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Awaiting slider imagery</p>
          </div>
        )}

        {/* Hero Content Overlay */}
        <div className="container mx-auto px-4 md:px-8 pb-16 z-10 flex flex-col items-center text-center relative max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4 text-zinc-300"
          >
            NEW COLLECTION @{new Date().getFullYear()}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm md:text-md text-zinc-300 max-w-lg mb-8 leading-relaxed"
          >
            Explore curated fashion essentials designed for comfort, style, confidence, and effortless everyday elegance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button
              onClick={() => navigate("/shop/listing")}
              className="bg-white text-black pl-8 pr-2 py-2 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-black hover:text-white border border-white transition-all duration-300 flex items-center gap-4 group"
            >
              Shop Now
              <span className="w-8 h-8 rounded-full bg-black text-white group-hover:bg-white group-hover:text-black flex items-center justify-center transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </motion.div>
        </div>

        {/* Huge Banner Background Text */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none select-none z-10">
          <h1 className="text-[18vw] font-bold text-center text-white/10 leading-[0.7] tracking-[0.05em] uppercase w-full">
            LUXERIDGE
          </h1>
        </div>
      </section>

      {/* 2. Experience Section */}
      <section className="py-24 bg-white border-b border-zinc-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image Wrapper */}
            <div className="lg:col-span-5 relative aspect-[3/4] bg-zinc-50 rounded-2xl overflow-hidden group">
              <img
                src={featureImageList?.[0]?.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600"}
                alt="Brand experience"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-300 mb-2">*EXPERIENCE</p>
                <h3 className="text-2xl font-bold uppercase tracking-tight">Unmatched Comfort & Style</h3>
              </div>
            </div>

            {/* Right Cards Wrap */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  id: "01",
                  title: "Premium Quality",
                  desc: "We use soft, durable, skin-friendly fabrics designed to ensure lasting comfort and quality in every single piece.",
                  icon: ShieldCheck,
                },
                {
                  id: "02",
                  title: "Fast & Secure Delivery",
                  desc: "Your orders are packed with extreme care and delivered quickly across the country for a frictionless shopping experience.",
                  icon: Truck,
                },
                {
                  id: "03",
                  title: "10-Day Return Policy",
                  desc: "Not satisfied? Get quick, hassle-free returns or exchanges within 10 days for complete peace of mind.",
                  icon: RefreshCw,
                },
                {
                  id: "04",
                  title: "Real User Reviews",
                  desc: "Loved by thousands worldwide, earning stellar ratings and positive feedback on all fit collections.",
                  icon: Star,
                },
              ].map((card) => (
                <div key={card.id} className="p-6 rounded-xl bg-[#f8f8f8] hover:bg-white border border-transparent hover:border-zinc-200 transition-all duration-300 space-y-4 shadow-sm hover:shadow">
                  <div className="flex justify-between items-center">
                    <span className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                      <card.icon className="w-5 h-5 text-black" />
                    </span>
                    <span className="font-bold text-zinc-300 text-sm">{card.id}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-md text-black uppercase tracking-tight mb-2">{card.title}</h4>
                    <p className="text-zinc-500 text-xs leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Collection Section (Hot Deals) */}
      <section className="py-24 bg-[#f8f8f8]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">*COLLECTIONS</p>
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-black">
                OUR HOT COLLECTIONS
              </h2>
            </div>
            <button
              onClick={() => navigate("/shop/listing")}
              className="bg-black text-white hover:bg-zinc-800 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:translate-x-[2px]"
            >
              Explore All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotCollections.map((product) => (
              <ShoppingProductTile
                key={product._id}
                product={product}
                handleAddtoCart={handleAddtoCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Browse Categories Tab Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">*CATEGORY</p>
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-black">
              BROWSE OUR CATEGORIES
            </h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Explore handpicked essentials designed to refine your style and enhance your everyday comfort.
            </p>
          </div>

          {/* Gender selection */}
          <div className="flex justify-center gap-6 mb-8 border-b border-zinc-100 pb-4">
            <button
              onClick={() => handleGenderViewChange("MEN")}
              className={`pb-2 font-bold uppercase tracking-widest text-sm relative transition-all duration-300 ${
                genderView === "MEN" ? "text-black" : "text-zinc-300 hover:text-zinc-500"
              }`}
            >
              Men Collection
              {genderView === "MEN" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
              )}
            </button>
            <button
              onClick={() => handleGenderViewChange("WOMEN")}
              className={`pb-2 font-bold uppercase tracking-widest text-sm relative transition-all duration-300 ${
                genderView === "WOMEN" ? "text-black" : "text-zinc-300 hover:text-zinc-500"
              }`}
            >
              Women Collection
              {genderView === "WOMEN" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
              )}
            </button>
          </div>

          {/* Subcategory Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {["All", "winterwear", "plus-size", "shirts", "t-shirts", "jeans", "dresses", "activewear"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCategoryTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                  activeCategoryTab.toLowerCase() === tab.toLowerCase()
                    ? "bg-black border-black text-white shadow-sm"
                    : "bg-[#f8f8f8] border-zinc-200 text-zinc-500 hover:border-black hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tabFilteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tabFilteredProducts.map((product) => (
                <ShoppingProductTile
                  key={product._id}
                  product={product}
                  handleAddtoCart={handleAddtoCart}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-zinc-200 rounded-2xl">
              <p className="text-zinc-400 text-sm">No items found in this subcategory.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Comfort Style Info Section */}
      <section className="py-24 bg-[#f8f8f8]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">*FIT & FORM</p>
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-black leading-tight">
                COMFORT AND STYLE IN EVERY STITCH
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-lg">
                Crafted for details, our collections match modern lines with durable and soft materials. Re-frame your styling requirements with apparel that fits you exactly.
              </p>
              <button
                onClick={() => navigate("/shop/listing")}
                className="bg-black text-white hover:bg-zinc-800 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              >
                Discover Collection
              </button>
            </div>

            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 relative group">
              <img
                src={featureImageList?.[1]?.image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800"}
                alt="Styling representation"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Discount Banner Section */}
      <section className="py-20 bg-zinc-950 text-white relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-[0.03] font-bold text-[30vw] select-none pointer-events-none leading-none tracking-tighter text-center flex items-center justify-center">
          OFFER
        </div>
        <div className="container mx-auto px-4 text-center space-y-6 z-10">
          <span className="bg-white/10 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10">
            SEASONAL EVENT
          </span>
          <h2 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter max-w-2xl mx-auto leading-tight">
            UP TO 40% OFF LATEST TRENDS
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Upgrade your closet with curated clothing packages, tailored to comfort and elegant structures. 10-day returns guaranteed.
          </p>
          <button
            onClick={() => navigate("/shop/listing")}
            className="bg-white text-black hover:bg-zinc-200 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
          >
            Claim Discount
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
