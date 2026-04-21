import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Star,
  TrendingUp,
  Sparkles,
  Flame,
  Zap,
  Crown,
  TrendingUpIcon,
  Clock4,
  Shirt,
  SparklesIcon,
  Heart,
  ShoppingBag,
  Plus,
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
  resetProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Dialog } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { getFeatureImages } from "@/store/common-slice";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/shopping-view/footer";
import ShoppingSubheader from "@/components/shopping-view/sub-header";
import { motion, AnimatePresence } from "framer-motion";

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Initialize gender view from localStorage or default to "MEN"
  const getInitialGenderView = () => {
    const savedGender = localStorage.getItem("selectedGender");
    if (savedGender === "man") return "MEN";
    if (savedGender === "woman") return "WOMEN";
    return "MEN"; // default
  };

  const [activeCategory, setActiveCategory] = useState(getInitialGenderView());
  const [genderView, setGenderView] = useState(getInitialGenderView());

  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const revealVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemReveal = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Enhanced product filtering based on localStorage gender
  const featuredProducts = useMemo(() => {
    if (!productList) return [];
    const savedGender = localStorage.getItem("selectedGender");
    let filteredProducts = [...productList].filter((product) => product.isFeatured);
    if (savedGender) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.category === savedGender ||
          product.gender === savedGender ||
          !product.category
      );
    }
    return filteredProducts.slice(0, 8);
  }, [productList]);

  const menProducts = useMemo(() => {
    if (!productList) return [];
    return [...productList]
      .filter((product) => product.category === "men" || product.gender === "men")
      .slice(0, 8);
  }, [productList]);

  const womenProducts = useMemo(() => {
    if (!productList) return [];
    return [...productList]
      .filter((product) => product.category === "women" || product.gender === "women")
      .slice(0, 8);
  }, [productList]);

  const bestSellingProducts = useMemo(() => {
    if (!productList) return [];
    const savedGender = localStorage.getItem("selectedGender");
    let filteredProducts = [...productList].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    if (savedGender) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.category === savedGender ||
          product.gender === savedGender ||
          !product.category
      );
    }
    return filteredProducts.slice(0, 8);
  }, [productList]);

  const currentGenderProducts = useMemo(() => {
    const savedGender = localStorage.getItem("selectedGender");
    if (savedGender === "man") return menProducts;
    if (savedGender === "woman") return womenProducts;
    return genderView === "MEN" ? menProducts : womenProducts;
  }, [genderView, menProducts, womenProducts]);

  const categories = [
    "MEN", "WOMEN", "WINTERWEAR", "PLUS-SIZE", "SHIRTS", "T-SHIRTS", 
    "JEANS", "DRESSES", "SHORTS", "ACTIVEWEAR", "ACCESSORIES",
  ];

  const handleGenderViewChange = (newGenderView) => {
    const storageGender = newGenderView === "MEN" ? "man" : "woman";
    localStorage.setItem("selectedGender", storageGender);
    setGenderView(newGenderView);
    setActiveCategory(newGenderView);
  };

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prevSlide) =>
      prevSlide === featureImageList.length - 1 ? 0 : prevSlide + 1
    );
  }, [featureImageList.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? featureImageList.length - 1 : prevSlide - 1
    );
  }, [featureImageList.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const getVisibleSlides = useCallback(() => {
    if (!featureImageList || featureImageList.length === 0) return [];
    const slides = [];
    for (let i = 0; i < Math.min(3, featureImageList.length); i++) {
      const slideIndex = (currentSlide + i) % featureImageList.length;
      slides.push(featureImageList[slideIndex]);
    }
    return slides;
  }, [featureImageList, currentSlide]);

  const visibleSlides = getVisibleSlides();

  useEffect(() => {
    if (activeCategory === "MEN" || activeCategory === "WOMEN") {
      const storageGender = activeCategory === "MEN" ? "man" : "woman";
      localStorage.setItem("selectedGender", storageGender);
      setGenderView(activeCategory);
    }
  }, [activeCategory]);

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = { [section]: [getCurrentItem.id] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleAddtoCart(getCurrentProductId, selectedSize = null) {
    if (!selectedSize) {
      toast({ title: "Please select a size first", variant: "destructive" });
      return;
    }
    dispatch(
      addToCart({ productId: getCurrentProductId, quantity: 1, selectedSize })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems());
        toast({ title: "Product added to cart successfully!" });
      }
    });
  }

  useEffect(() => {
    if (featureImageList.length <= 1) return;
    const timer = setInterval(() => goToNextSlide(), 4000);
    return () => clearInterval(timer);
  }, [featureImageList.length, goToNextSlide]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: { isActive: true },
        sortParams: "most-selling",
      })
    );
    dispatch(getFeatureImages());
    dispatch(resetProductDetails());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1">
        <div className="sticky top-20 z-30">
          <ShoppingSubheader
            genderView={genderView}
            setGenderView={setGenderView}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            categories={categories}
          />
        </div>

        {/* Hero Carousel */}
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-zinc-100 group">
          {featureImageList && featureImageList.length > 0 ? (
            <>
              <div className="flex h-full transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]">
                {visibleSlides.map((slide, index) => (
                  <motion.div
                    key={`${slide?.id}-${index}`}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "circOut" }}
                    className="flex-shrink-0 w-full lg:w-1/3 h-full relative group/slide overflow-hidden"
                  >
                    <img
                      src={slide?.image}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-[4s] group-hover/slide:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover/slide:bg-transparent transition-all duration-700" />
                    <div className="absolute bottom-10 left-10 opacity-0 group-hover/slide:opacity-100 transition-all duration-700 translate-y-4 group-hover/slide:translate-y-0 text-white">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-2 drop-shadow-md">Curated Asset</p>
                        <h3 className="text-3xl font-black uppercase tracking-tighter drop-shadow-lg">Exploration {index + 1}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>

              {featureImageList.length > 1 && (
                <>
                  <button
                    onClick={goToPrevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white backdrop-blur-xl text-black p-5 rounded-none transition-all duration-[0.6s] ease-[cubic-bezier(0.4,0,0.2,1)] opacity-0 group-hover:opacity-100 border border-white/20 translate-x-[-10px] group-hover:translate-x-0 hidden lg:block"
                    aria-label="Previous slide"
                  >
                    <ChevronLeftIcon className="w-7 h-7 stroke-[1px]" />
                  </button>
                  <button
                    onClick={goToNextSlide}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white backdrop-blur-xl text-black p-5 rounded-none transition-all duration-[0.6s] ease-[cubic-bezier(0.4,0,0.2,1)] opacity-0 group-hover:opacity-100 border border-white/20 translate-x-[10px] group-hover:translate-x-0 hidden lg:block"
                    aria-label="Next slide"
                  >
                    <ChevronRightIcon className="w-7 h-7 stroke-[1px]" />
                  </button>
                </>
              )}

              {featureImageList.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex justify-center space-x-4 z-10">
                  {featureImageList.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-[1px] transition-all duration-700 ${index === currentSlide
                        ? "bg-black w-10"
                        : "bg-black/20 w-6 hover:bg-black/40"
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-50">
              <div className="text-center">
                <SparklesIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Awaiting visual assets</p>
              </div>
            </div>
          )}
        </div>

        {/* Gender Collection Section */}
        {(menProducts.length > 0 || womenProducts.length > 0) && (
          <motion.section 
            variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            className="py-16 md:py-24 bg-white scroll-mt-20"
          >
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex flex-col items-center mb-16">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300 mb-6 border-b border-zinc-100 pb-2">Select Architecture</p>
                <div className="flex gap-10">
                  <button
                    onClick={() => handleGenderViewChange("MEN")}
                    className={`group relative text-xl font-black uppercase tracking-tighter transition-all duration-500 ${genderView === "MEN" ? "text-black" : "text-zinc-200 hover:text-zinc-400"}`}
                  >
                    MEN_LAB
                    <span className={`absolute -bottom-2 left-0 h-[2px] bg-black transition-all duration-500 ${genderView === "MEN" ? "w-full" : "w-0"}`} />
                  </button>
                  <button
                    onClick={() => handleGenderViewChange("WOMEN")}
                    className={`group relative text-xl font-black uppercase tracking-tighter transition-all duration-500 ${genderView === "WOMEN" ? "text-black" : "text-zinc-200 hover:text-zinc-400"}`}
                  >
                    WOMEN_CORE
                    <span className={`absolute -bottom-2 left-0 h-[2px] bg-black transition-all duration-500 ${genderView === "WOMEN" ? "w-full" : "w-0"}`} />
                  </button>
                </div>
              </div>

              <div className="mb-16 space-y-3">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Section 01 // Seasonal Direction</p>
                 <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] max-w-4xl">
                   {genderView === "MEN" ? "Masculine Minimalism" : "Contemporary Femininity"}
                 </h2>
              </div>

              <div className="flex flex-wrap gap-3 mb-16">
                {(genderView === "MEN"
                  ? ["T-Shirts", "Shirts", "Jeans", "Jackets", "Activewear"]
                  : ["Dresses", "Tops", "Jeans", "Skirts", "Activewear"]
                ).map((category) => (
                  <button
                    key={category}
                    className="group flex items-center gap-3 px-6 py-3 border border-zinc-100 bg-white hover:border-black transition-all duration-500"
                    onClick={() => navigate("/shop/listing")}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-black">{category}</span>
                    <Plus className="w-3 h-3 text-zinc-300 group-hover:text-black transition-colors" />
                  </button>
                ))}
              </div>

              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {currentGenderProducts.map((productItem) => (
                  <motion.div key={productItem._id} variants={itemReveal}>
                    <ShoppingProductTile product={productItem} handleAddtoCart={handleAddtoCart} />
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-20 border-t border-zinc-100 pt-10 text-center md:text-left">
                <Button
                  onClick={() => handleNavigateToListingPage({ id: genderView.toLowerCase() }, "category")}
                  className="bg-black hover:bg-zinc-800 text-white rounded-none px-10 py-6 text-[10px] font-black tracking-[0.4em] uppercase transition-all duration-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] h-auto"
                >
                  Explore Complete {genderView === "MEN" ? "Masculine" : "Feminine"} Anthology
                </Button>
              </div>
            </div>
          </motion.section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <motion.section 
            variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            className="py-16 md:py-24 bg-zinc-50"
          >
            <div className="container mx-auto px-4 md:px-8">
              <div className="mb-16 space-y-3">
                 <div className="flex items-center gap-4">
                   <Crown className="w-4 h-4 text-black" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Section 02 // Curated Excellence</p>
                 </div>
                 <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] max-w-4xl">Featured Archive</h2>
              </div>
              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {featuredProducts.map((productItem) => (
                  <motion.div key={productItem._id} variants={itemReveal}>
                    <ShoppingProductTile product={productItem} handleAddtoCart={handleAddtoCart} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* Best Sellers */}
        {bestSellingProducts.length > 0 && (
          <motion.section 
            variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            className="py-16 md:py-24 bg-white"
          >
            <div className="container mx-auto px-4 md:px-8">
              <div className="mb-16 space-y-3 text-center">
                 <Flame className="w-6 h-6 text-black mx-auto mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Section 03 // Trending Frequency</p>
                 <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">Most Selling Assets</h2>
              </div>
              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {bestSellingProducts.map((productItem, index) => (
                  <motion.div key={productItem._id} variants={itemReveal} className="relative group">
                    {index < 3 && (
                      <div className="absolute -top-5 -left-5 z-20 w-10 h-10 bg-black flex items-center justify-center">
                         <span className="text-white font-black text-[10px]">0{index + 1}</span>
                      </div>
                    )}
                    <ShoppingProductTile product={productItem} handleAddtoCart={handleAddtoCart} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* Call to Action */}
        <motion.section 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.5 }}
          className="py-24 md:py-32 bg-black relative overflow-hidden group"
        >
          <div className="absolute inset-0 opacity-[0.03] font-black text-[20vw] leading-none select-none pointer-events-none tracking-tighter overflow-hidden flex items-center justify-center text-white">FRESH</div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}>
              <Sparkles className="w-12 h-12 mx-auto mb-10 text-white/30 group-hover:text-white group-hover:rotate-12 transition-all duration-1000" />
            </motion.div>
            <h2 className="text-4xl md:text-7xl font-black text-white mb-10 uppercase tracking-tighter leading-none">Architect Your <br /> Aesthetic</h2>
            <p className="text-lg text-zinc-500 mb-12 max-w-xl mx-auto font-light leading-relaxed tracking-wide lowercase italic">"Discover a curated selection cross-referenced for ultimate quality and timeless relevance."</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-zinc-200 text-[10px] py-6 px-10 rounded-none font-black uppercase tracking-[0.4em] h-auto transition-all duration-500 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.15)]"
                onClick={() => navigate("/shop/listing")}
              >Launch Exploration</Button>
              <button className="text-white text-[9px] font-black uppercase tracking-[0.4em] border-b-2 border-white/20 pb-2 hover:border-white transition-all duration-500" onClick={() => navigate("/shop/listing")}>View Latest Archives</button>
            </div>
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}

export default ShoppingHome;

