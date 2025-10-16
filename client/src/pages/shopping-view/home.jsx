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
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
  resetProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/shopping-view/footer";
import ShoppingSubheader from "@/components/shopping-view/sub-header";

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
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Enhanced product filtering based on localStorage gender
  const featuredProducts = useMemo(() => {
    if (!productList) return [];
    const savedGender = localStorage.getItem("selectedGender");
    
    let filteredProducts = [...productList].filter((product) => product.isFeatured);
    
    // Filter by saved gender if available
    if (savedGender) {
      filteredProducts = filteredProducts.filter(
        (product) => 
          product.category === savedGender || 
          product.gender === savedGender ||
          !product.category // Include products without category
      );
    }
    
    return filteredProducts.slice(0, 8);
  }, [productList]);

  const menProducts = useMemo(() => {
    if (!productList) return [];
    return [...productList]
      .filter(
        (product) => product.category === "men" || product.gender === "men"
      )
      .slice(0, 8);
  }, [productList]);

  const womenProducts = useMemo(() => {
    if (!productList) return [];
    return [...productList]
      .filter(
        (product) => product.category === "women" || product.gender === "women"
      )
      .slice(0, 8);
  }, [productList]);

  const bestSellingProducts = useMemo(() => {
    if (!productList) return [];
    const savedGender = localStorage.getItem("selectedGender");
    
    let filteredProducts = [...productList].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    
    // Filter by saved gender if available
    if (savedGender) {
      filteredProducts = filteredProducts.filter(
        (product) => 
          product.category === savedGender || 
          product.gender === savedGender ||
          !product.category // Include products without category
      );
    }
    
    return filteredProducts.slice(0, 8);
  }, [productList]);

  const newArrivals = useMemo(() => {
    if (!productList) return [];
    const savedGender = localStorage.getItem("selectedGender");
    
    let filteredProducts = [...productList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Filter by saved gender if available
    if (savedGender) {
      filteredProducts = filteredProducts.filter(
        (product) => 
          product.category === savedGender || 
          product.gender === savedGender ||
          !product.category // Include products without category
      );
    }
    
    return filteredProducts.slice(0, 8);
  }, [productList]);

  // Get products based on current gender view
  const currentGenderProducts = useMemo(() => {
    const savedGender = localStorage.getItem("selectedGender");
    
    if (savedGender === "man") return menProducts;
    if (savedGender === "woman") return womenProducts;
    
    // Fallback to state-based filtering
    return genderView === "MEN" ? menProducts : womenProducts;
  }, [genderView, menProducts, womenProducts]);

  const categories = [
    "MEN",
    "WOMEN",
    "WINTERWEAR",
    "PLUS-SIZE",
    "SHIRTS",
    "T-SHIRTS",
    "JEANS",
    "DRESSES",
    "SHORTS",
    "ACTIVEWEAR",
    "ACCESSORIES",
  ];

  // Enhanced gender view handler that syncs with localStorage
  const handleGenderViewChange = (newGenderView) => {
    const storageGender = newGenderView === "MEN" ? "man" : "woman";
    
    // Save to localStorage
    localStorage.setItem("selectedGender", storageGender);
    
    // Update state
    setGenderView(newGenderView);
    setActiveCategory(newGenderView);
  };

  // Rest of the component remains the same...
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

  // Get visible slides for desktop (current and next two)
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
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId, selectedSize = null) {
    if (!selectedSize) {
      toast({
        title: "Please select a size first",
        variant: "destructive",
      });
      return;
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        selectedSize: selectedSize,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product added to cart successfully!",
        });
      } else if (data?.payload?.message) {
        toast({
          title: data.payload.message,
          variant: "destructive",
        });
      }
    });
  }

  function handleCloseDialog() {
    setOpenDetailsDialog(false);
    setTimeout(() => {
      dispatch(resetProductDetails());
    }, 300);
  }

  useEffect(() => {
    if (productDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);

  // Auto-slide functionality
  useEffect(() => {
    if (featureImageList.length <= 1) return;

    const timer = setInterval(() => {
      goToNextSlide();
    }, 4000);

    return () => clearInterval(timer);
  }, [featureImageList.length, goToNextSlide]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: { isActive: true },
        sortParams: "most-selling",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1">
        {/* Enhanced Subheader with Black & White Theme */}
        <ShoppingSubheader
          genderView={genderView}
          setGenderView={setGenderView}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categories={categories}
        />

        {/* Hero Carousel */}
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden bg-gray-100">
          {featureImageList && featureImageList.length > 0 ? (
            <>
              {/* Mobile View - Single Full Image */}
              <div className="block lg:hidden">
                <div className="relative h-[500px] w-full">
                  <img
                    src={featureImageList[currentSlide]?.image}
                    alt={`Slide ${currentSlide + 1}`}
                    className="w-full h-full object-contain bg-white"
                  />
                </div>
              </div>

              {/* Desktop View - Multi Image Carousel */}
              <div className="hidden lg:block relative h-[600px] overflow-hidden">
                <div className="flex h-full transition-transform duration-500 ease-in-out">
                  {visibleSlides.map((slide, index) => (
                    <div
                      key={`${slide?.id}-${index}`}
                      className="flex-shrink-0 w-1/3 h-full relative"
                    >
                      <img
                        src={slide?.image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows - Desktop Only */}
              {featureImageList.length > 1 && (
                <>
                  <button
                    onClick={goToPrevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 lg:opacity-50 lg:hover:opacity-100 hidden lg:block"
                    aria-label="Previous slide"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={goToNextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 lg:opacity-50 lg:hover:opacity-100 hidden lg:block"
                    aria-label="Next slide"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Slide indicators */}
              {featureImageList.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                  {featureImageList.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "bg-red-600 scale-125"
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Mobile slide counter */}
              <div className="absolute top-4 right-4 lg:hidden">
                <div className="text-black text-sm font-medium bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  {currentSlide + 1} / {featureImageList.length}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-[400px] lg:h-[600px] flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p>Featured images coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Gender Collection Section */}
        {(menProducts.length > 0 || womenProducts.length > 0) && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              {/* Toggle Button for Men/Women */}
              <div className="flex justify-center mb-12">
                <div className="bg-gray-100 rounded-full p-1 flex border border-gray-200">
                  <button
                    onClick={() => setGenderView("MEN")}
                    className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      genderView === "MEN"
                        ? "bg-black text-white shadow-md"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Shirt className="w-4 h-4" />
                      <span>MEN</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setGenderView("WOMEN")}
                    className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      genderView === "WOMEN"
                        ? "bg-black text-white shadow-md"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>WOMEN</span>
                    </div>
                  </button>
                </div>
              </div>

        {/* Rest of the Gender Collection Section remains the same... */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            {genderView === "MEN" ? (
              <Shirt className="w-8 h-8 text-gray-600 mr-3" />
            ) : (
              <Heart className="w-8 h-8 text-gray-600 mr-3" />
            )}
            <Badge className="px-4 py-2 text-sm bg-red-600 text-white border-none">
              {genderView === "MEN"
                ? "Men's Collection"
                : "Women's Collection"}
            </Badge>
          </div>
          <h2 className="text-4xl font-bold text-black mb-4">
            {genderView === "MEN" ? "Style for Men" : "Fashion for Women"}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {genderView === "MEN"
              ? "Discover premium menswear that combines comfort, quality, and contemporary style"
              : "Express your unique style with our carefully curated women's collection"}
          </p>
        </div>

              {/* Category Quick Links */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {(genderView === "MEN"
                  ? [
                      "T-Shirts",
                      "Shirts",
                      "Jeans",
                      "Jackets",
                      "Activewear",
                      "Accessories",
                    ]
                  : [
                      "Dresses",
                      "Tops",
                      "Jeans",
                      "Skirts",
                      "Activewear",
                      "Accessories",
                    ]
                ).map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    className="bg-white border-gray-300 text-gray-700 hover:bg-black hover:text-white rounded-full px-6"
                    onClick={() => navigate("/shop/listing")}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {currentGenderProducts.map((productItem) => (
                  <div
                    key={productItem._id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
                  >
                    <ShoppingProductTile
                      handleGetProductDetails={handleGetProductDetails}
                      product={productItem}
                      handleAddtoCart={handleAddtoCart}
                    />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button
                  className="bg-black text-white hover:bg-gray-800 px-8 py-3 border-none"
                  onClick={() =>
                    handleNavigateToListingPage(
                      { id: genderView.toLowerCase() },
                      "category"
                    )
                  }
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Explore {genderView === "MEN" ? "Men's" : "Women's"}{" "}
                  Collection
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center mb-4">
                  <Crown className="w-4 h-4 text-gray-600 mr-3" />
                  <Badge className="px-4 py-2 text-sm bg-red-600 text-white border-none">
                    Exclusive Collection
                  </Badge>
                </div>
                <h2 className="text-4xl font-bold text-black mb-4">
                  Featured Products
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Curated excellence - handpicked items that define style and
                  quality
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((productItem) => (
                  <div key={productItem._id} className="group">
                    <ShoppingProductTile
                      handleGetProductDetails={handleGetProductDetails}
                      product={productItem}
                      handleAddtoCart={handleAddtoCart}
                    />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button
                  className="bg-black text-white hover:bg-gray-800 px-8 py-3 border-none"
                  onClick={() =>
                    handleNavigateToListingPage(
                      { id: "featured" },
                      "isFeatured"
                    )
                  }
                >
                  <Star className="w-5 h-5 mr-2" />
                  View All Featured
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Best Sellers */}
        {bestSellingProducts.length > 0 && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center mb-4">
                  <Flame className="w-8 h-8 text-gray-600 mr-3" />
                  <Badge className="px-4 py-2 text-sm bg-red-600 text-white border-none">
                    Hot Right Now
                  </Badge>
                </div>
                <h2 className="text-4xl font-bold text-black mb-4">
                  Best Sellers
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Join the trendsetters - products loved by thousands of
                  customers
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {bestSellingProducts.map((productItem, index) => (
                  <div key={productItem._id} className="relative">
                    {index < 3 && (
                      <div className="absolute -top-3 -left-3 z-20">
                        <div
                          className={`px-3 py-1 text-xs font-bold text-white rounded-full ${
                            index === 0
                              ? "bg-red-600"
                              : index === 1
                              ? "bg-black"
                              : "bg-gray-700"
                          }`}
                        >
                          #{index + 1}
                        </div>
                      </div>
                    )}
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                      <ShoppingProductTile
                        handleGetProductDetails={handleGetProductDetails}
                        product={productItem}
                        handleAddtoCart={handleAddtoCart}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button
                  className="bg-black text-white hover:bg-gray-800 px-8 py-3 border-none"
                  onClick={() =>
                    handleNavigateToListingPage(
                      { id: "bestSellers" },
                      "bestSellers"
                    )
                  }
                >
                  <TrendingUpIcon className="w-5 h-5 mr-2" />
                  See All Best Sellers
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-gray-600 mr-3" />
                  <Badge className="px-4 py-2 text-sm bg-red-600 text-white border-none">
                    Just Launched
                  </Badge>
                </div>
                <h2 className="text-4xl font-bold text-black mb-4">
                  New Arrivals
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Fresh off the shelf - be the first to experience our latest
                  additions
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {newArrivals.map((productItem) => (
                  <div
                    key={productItem._id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 relative"
                  >
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-red-600 text-white border-none">
                        NEW
                      </Badge>
                    </div>
                    <ShoppingProductTile
                      handleGetProductDetails={handleGetProductDetails}
                      product={productItem}
                      handleAddtoCart={handleAddtoCart}
                    />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button
                  className="bg-black text-white hover:bg-gray-800 px-8 py-3 border-none"
                  onClick={() =>
                    handleNavigateToListingPage(
                      { id: "newArrivals" },
                      "newArrivals"
                    )
                  }
                >
                  <Clock4 className="w-5 h-5 mr-2" />
                  Explore New Arrivals
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Find Your Style?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore our complete collection and discover products that match
              your unique personality
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-red-600 text-white hover:bg-red-700 text-lg px-8 py-3 border-2 border-red-600 font-bold"
                onClick={() => navigate("/shop/listing")}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Explore All Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-black text-lg px-8 py-3"
                onClick={() => navigate("/shop/listing")}
              >
                <Star className="w-5 h-5 mr-2" />
                View Deals
              </Button>
            </div>
          </div>
        </section>

        {/* Product Details Dialog */}
        <ProductDetailsDialog
          open={openDetailsDialog && productDetails !== null}
          setOpen={handleCloseDialog}
          productDetails={productDetails}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ShoppingHome;
