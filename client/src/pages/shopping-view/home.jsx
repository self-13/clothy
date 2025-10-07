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
import { useEffect, useState, useMemo } from "react";
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

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState("MEN");
  const [genderView, setGenderView] = useState("MEN"); // New state for toggle button
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const featuredProducts = useMemo(() => {
    if (!productList) return [];
    return [...productList].filter((product) => product.isFeatured).slice(0, 8);
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
    return [...productList]
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 8);
  }, [productList]);

  const newArrivals = useMemo(() => {
    if (!productList) return [];
    return [...productList]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  }, [productList]);

  // Get current products based on gender view
  const currentGenderProducts = useMemo(() => {
    return genderView === "MEN" ? menProducts : womenProducts;
  }, [genderView, menProducts, womenProducts]);

  const categories = [
    "MEN",
    "WOMEN", 
    "WINTERWEAR",
    "PLUS SIZE",
    "SHIRTS",
    "T-SHIRTS",
    "JEANS",
    "DRESSES",
    "SHORTS",
    "ACTIVEWEAR",
    "ACCESSORIES",
    "SALE"
  ];

  // Update gender view when category changes to MEN or WOMEN
  useEffect(() => {
    if (activeCategory === "MEN" || activeCategory === "WOMEN") {
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

  useEffect(() => {
    if (featureImageList.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [featureImageList]);

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

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide(
      (prevSlide) =>
        (prevSlide - 1 + featureImageList.length) % featureImageList.length
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        {/* Category Navigation Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              {/* Category Links */}
              <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? "text-black font-bold border-b-2 border-black"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Carousel */}
        <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-gray-100">
          {featureImageList && featureImageList.length > 0 ? (
            featureImageList.map((slide, index) => (
              <div
                key={index}
                className={`${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                } absolute top-0 left-0 w-full h-full transition-opacity duration-1000 flex items-center justify-center`}
              >
                <img
                  src={slide?.image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white max-w-2xl px-4">
                    <div className="mb-6">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                      {slide?.title || "Welcome to Our Store"}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-200 font-light">
                      {slide?.description ||
                        "Discover amazing products at great prices"}
                    </p>
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-gray-100 transition-all duration-300 text-lg px-8 py-3 border-2 border-white font-bold"
                      onClick={() => navigate("/shop/listing")}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center text-black">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-black" />
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-black">
                  Welcome to Our Store
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-600 font-light">
                  Discover amazing products at great prices
                </p>
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 transition-all duration-300 text-lg px-8 py-3 border-2 border-black font-bold"
                  onClick={() => navigate("/shop/listing")}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Shopping
                </Button>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {featureImageList && featureImageList.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevSlide}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/80 text-white border-black/80 h-12 w-12 rounded-full"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextSlide}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/80 text-white border-black/80 h-12 w-12 rounded-full"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Slide indicators */}
          {featureImageList && featureImageList.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3 z-10">
              {featureImageList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 border-2 border-white ${
                    index === currentSlide 
                      ? "bg-white scale-125" 
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Gender Collection Section with Toggle Button */}
        {(menProducts.length > 0 || womenProducts.length > 0) && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              {/* Toggle Button for Men/Women */}
              <div className="flex justify-center mb-12">
                <div className="bg-gray-100 rounded-full p-1 flex">
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

              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center mb-4">
                  {genderView === "MEN" ? (
                    <Shirt className="w-8 h-8 text-gray-600 mr-3" />
                  ) : (
                    <Heart className="w-8 h-8 text-gray-600 mr-3" />
                  )}
                  <Badge className="px-4 py-2 text-sm bg-gray-800 text-white border-none">
                    {genderView === "MEN" ? "Men's Collection" : "Women's Collection"}
                  </Badge>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  {genderView === "MEN" ? "Style for Men" : "Fashion for Women"}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {genderView === "MEN" 
                    ? "Discover premium menswear that combines comfort, quality, and contemporary style"
                    : "Express your unique style with our carefully curated women's collection"
                  }
                </p>
              </div>

              {/* Category Quick Links */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {(genderView === "MEN" 
                  ? ['T-Shirts', 'Shirts', 'Jeans', 'Jackets', 'Activewear', 'Accessories']
                  : ['Dresses', 'Tops', 'Jeans', 'Skirts', 'Activewear', 'Accessories']
                ).map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full px-6"
                    onClick={() => navigate("/shop/listing")}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {currentGenderProducts.map((productItem) => (
                  <div key={productItem._id} className="bg-white rounded-lg overflow-hidden shadow-sm">
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
                  className="bg-gray-800 text-white hover:bg-gray-700 px-8 py-3 border-none"
                  onClick={() => handleNavigateToListingPage({ id: genderView.toLowerCase() }, 'category')}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Explore {genderView === "MEN" ? "Men's" : "Women's"} Collection
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
                  <Badge className="px-4 py-2 text-sm bg-gray-800 text-white border-none">
                    Exclusive Collection
                  </Badge>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Featured Products
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Curated excellence - handpicked items that define style and quality
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
                  className="bg-gray-800 text-white hover:bg-gray-700 px-8 py-3 border-none"
                  onClick={() => handleNavigateToListingPage({ id: 'featured' }, 'isFeatured')}
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
                  <Badge className="px-4 py-2 text-sm bg-gray-800 text-white border-none">
                    Hot Right Now
                  </Badge>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Best Sellers
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Join the trendsetters - products loved by thousands of customers
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {bestSellingProducts.map((productItem, index) => (
                  <div key={productItem._id} className="relative">
                    {index < 3 && (
                      <div className="absolute -top-3 -left-3 z-20">
                        <div className={`px-3 py-1 text-xs font-bold text-white rounded-full ${
                          index === 0 ? 'bg-gray-800' :
                          index === 1 ? 'bg-gray-600' :
                          'bg-gray-700'
                        }`}>
                          #{index + 1}
                        </div>
                      </div>
                    )}
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
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
                  className="bg-gray-800 text-white hover:bg-gray-700 px-8 py-3 border-none"
                  onClick={() => handleNavigateToListingPage({ id: 'bestSellers' }, 'bestSellers')}
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
                  <Badge className="px-4 py-2 text-sm bg-gray-800 text-white border-none">
                    Just Launched
                  </Badge>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  New Arrivals
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Fresh off the shelf - be the first to experience our latest additions
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {newArrivals.map((productItem) => (
                  <div key={productItem._id} className="bg-white rounded-lg overflow-hidden shadow-sm relative">
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-gray-800 text-white border-none">
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
                  className="bg-gray-800 text-white hover:bg-gray-700 px-8 py-3 border-none"
                  onClick={() => handleNavigateToListingPage({ id: 'newArrivals' }, 'newArrivals')}
                >
                  <Clock4 className="w-5 h-5 mr-2" />
                  Explore New Arrivals
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="py-20 bg-gray-900">
          <div className="container mx-auto px-4 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Find Your Style?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore our complete collection and discover products that match your unique personality
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-3 border-2 border-white font-bold"
                onClick={() => navigate("/shop/listing")}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Explore All Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-gray-900 text-lg px-8 py-3"
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