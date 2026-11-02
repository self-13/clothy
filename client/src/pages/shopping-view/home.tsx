import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllFilteredProducts, resetProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { getFeatureImages } from "@/store/common-slice";
import { useToast } from "@/components/ui/use-toast";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import Footer from "@/components/shopping-view/footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    }
  }
};

export default function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [genderView, setGenderView] = useState<"MEN" | "WOMEN">(() => {
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
        toast({ title: "Item added to your shopping bag." });
      }
    });
  };

  // Carousel controls
  const goToNextSlide = useCallback(() => {
    if (!featureImageList || featureImageList.length === 0) return;
    setCurrentSlide((prev) => (prev === featureImageList.length - 1 ? 0 : prev + 1));
  }, [featureImageList]);

  const goToPrevSlide = useCallback(() => {
    if (!featureImageList || featureImageList.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? featureImageList.length - 1 : prev - 1));
  }, [featureImageList]);

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
    if (!featureImageList || featureImageList.length <= 1) return;
    const timer = setInterval(() => goToNextSlide(), 6000);
    return () => clearInterval(timer);
  }, [featureImageList, goToNextSlide]);

  const hotCollections = useMemo(() => {
    if (!productList) return [];
    return productList.slice(0, 4);
  }, [productList]);

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
    return filtered.slice(0, 8);
  }, [productList, genderView, activeCategoryTab]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#121212] font-sans">
      
      {/* 1. Hero Section - Editorial Cover */}
      <section className="relative w-full h-[90vh] min-h-[600px] max-h-[920px] overflow-hidden bg-[#121212] text-white flex flex-col justify-end">
        {featureImageList && featureImageList.length > 0 ? (
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={featureImageList[currentSlide]?.image}
                alt="Editorial hero showcase"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }}
                className="w-full h-full object-cover object-center"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
            <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">Curating imagery</p>
          </div>
        )}

        {/* Hero Content Overlay */}
        <div className="container mx-auto px-4 md:px-8 pb-16 md:pb-24 z-10 relative max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-4"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-300 block">
              Autumn / Winter Capsule Edition
            </span>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-white font-normal tracking-tight leading-[1.08] max-w-2xl">
              Timeless Tailoring. Everyday Luxury.
            </h1>
            
            <p className="text-sm sm:text-base text-zinc-300 font-light max-w-md leading-relaxed pt-1">
              Curated garments engineered for relaxed comfort, precise drape, and enduring elegance.
            </p>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => navigate("/shop/listing")}
                className="bg-[#FAF9F6] text-[#121212] hover:bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] rounded-sm transition-all duration-200 active:scale-[0.97] flex items-center gap-3 shadow-md group"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Minimal Slider Controls */}
        {featureImageList && featureImageList.length > 1 && (
          <div className="absolute bottom-8 right-6 md:right-12 z-20 flex items-center gap-2">
            <button
              onClick={goToPrevSlide}
              aria-label="Previous slide"
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
            </button>
            <div className="flex gap-1.5 px-2">
              {featureImageList.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-[2px] transition-all duration-300 ${
                    currentSlide === idx ? "w-8 bg-white" : "w-3 bg-white/40"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={goToNextSlide}
              aria-label="Next slide"
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        )}
      </section>

      {/* 2. Brand Philosophy / Editorial Craft Section */}
      <section className="py-24 md:py-32 bg-[#FAF9F6] border-b border-zinc-200/60">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left: Editorial Image */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="lg:col-span-5 relative aspect-[4/5] bg-[#F4F3F0] rounded-sm overflow-hidden"
            >
              <img
                src={featureImageList?.[0]?.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800"}
                alt="Tailoring atelier"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-103"
              />
            </motion.div>

            {/* Right: Narrative Story */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="lg:col-span-7 space-y-8"
            >
              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block">
                  The Atelier Philosophy
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#121212] leading-[1.15]">
                  Formed by Intention, Cut for Effortless Wear.
                </h2>
              </div>

              <div className="space-y-4 text-zinc-600 font-light leading-relaxed text-sm sm:text-base max-w-xl">
                <p>
                  At Luxeridge, clothing is not treated as temporary novelty. Every pattern is cut with architectural precision, balancing generous tactile comfort with razor-sharp contours.
                </p>
                <p>
                  We source heavyweight organic fibers, soft brushed cottons, and breathable natural blends designed to hold their integrity year after year, wash after wash.
                </p>
              </div>

              {/* Quiet, authentic commitments */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-200/80">
                <div>
                  <h4 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#121212] mb-1">
                    Fine Natural Fibers
                  </h4>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed">
                    Selected for breathable weight, supple touch, and durability.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#121212] mb-1">
                    Mindful Proportions
                  </h4>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed">
                    Every silhouette drape tested for effortless daily movement.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#121212] mb-1">
                    Conscious Packaging
                  </h4>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed">
                    100% recyclable, zero-plastic presentation on every dispatch.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Featured Hot Collections */}
      <section className="py-24 md:py-32 bg-white border-b border-zinc-200/60">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block mb-2">
                New Releases
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#121212]">
                Curated Foundational Pieces
              </h2>
            </div>
            <button
              onClick={() => navigate("/shop/listing")}
              className="text-xs font-semibold uppercase tracking-[0.15em] text-[#121212] hover:text-zinc-500 flex items-center gap-1.5 pb-1 border-b border-[#121212] hover:border-zinc-500 transition-colors"
            >
              View All Garments
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {hotCollections.map((product: any) => (
              <motion.div key={product._id} variants={fadeInUp}>
                <ShoppingProductTile
                  product={product}
                  handleAddtoCart={handleAddtoCart}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Browse by Category & Subcategory Tab Section */}
      <section className="py-24 md:py-32 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center space-y-4 mb-12"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block">
              The Wardrobe
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#121212]">
              Explore by Silhouette
            </h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto font-light">
              Refined garments crafted to mix, match, and elevate your daily rotation.
            </p>
          </motion.div>

          {/* Gender Switcher */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex justify-center gap-8 mb-10 border-b border-zinc-200 pb-4 max-w-xs mx-auto"
          >
            <button
              onClick={() => handleGenderViewChange("MEN")}
              className={`pb-2 text-xs font-semibold uppercase tracking-[0.16em] relative transition-colors ${
                genderView === "MEN" ? "text-[#121212]" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              Men's Edit
              {genderView === "MEN" && (
                <motion.span layoutId="activeGenderBar" className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#121212]" />
              )}
            </button>
            <button
              onClick={() => handleGenderViewChange("WOMEN")}
              className={`pb-2 text-xs font-semibold uppercase tracking-[0.16em] relative transition-colors ${
                genderView === "WOMEN" ? "text-[#121212]" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              Women's Edit
              {genderView === "WOMEN" && (
                <motion.span layoutId="activeGenderBar" className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#121212]" />
              )}
            </button>
          </motion.div>

          {/* Subcategory Filter Tabs */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {["All", "shirts", "t-shirts", "jeans", "winterwear", "dresses", "activewear"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCategoryTab(tab)}
                className={`px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] rounded-sm transition-all duration-200 active:scale-95 ${
                  activeCategoryTab.toLowerCase() === tab.toLowerCase()
                    ? "bg-[#121212] text-white"
                    : "bg-white border border-zinc-200/80 text-zinc-600 hover:border-black hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </motion.div>

          {/* Products Grid */}
          {tabFilteredProducts.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            >
              {tabFilteredProducts.map((product: any) => (
                <motion.div key={product._id} variants={fadeInUp}>
                  <ShoppingProductTile
                    product={product}
                    handleAddtoCart={handleAddtoCart}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-20 text-center bg-white border border-dashed border-zinc-200 rounded-sm">
              <p className="text-zinc-400 text-xs font-light uppercase tracking-widest">
                No items currently found in this subcategory.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Editorial Focus Banner */}
      <section className="py-24 md:py-32 bg-[#F4F3EE] border-t border-b border-zinc-200/60">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="space-y-6"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block">
                Signature Aesthetic
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#121212] leading-[1.12]">
                Comfort and Structure in Every Stitch
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base font-light leading-relaxed max-w-lg">
                Engineered for versatile layering. Whether paired with structured denim or relaxed trousers, each garment brings understated confidence to everyday living.
              </p>
              <div>
                <button
                  onClick={() => navigate("/shop/listing")}
                  className="bg-[#121212] text-white hover:bg-black px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] rounded-sm transition-all duration-200 active:scale-[0.97]"
                >
                  Discover The Collection
                </button>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="aspect-[4/3] bg-zinc-200 rounded-sm overflow-hidden"
            >
              <img
                src={featureImageList?.[1]?.image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800"}
                alt="Collection spotlight"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-103"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Editorial Seasonal Note */}
      <section className="py-24 bg-[#121212] text-[#FAF9F6] relative overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-6">
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-zinc-400 block">
            Special Invitation
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal leading-[1.15]">
            Archive & Seasonal Curations
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base font-light max-w-lg mx-auto leading-relaxed">
            Discover limited editions and seasonal archive selections crafted with exceptional attention to fabric and fit.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/shop/listing")}
              className="bg-[#FAF9F6] text-[#121212] hover:bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] rounded-sm transition-all duration-200 active:scale-[0.97] shadow-lg"
            >
              Shop The Selection
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
