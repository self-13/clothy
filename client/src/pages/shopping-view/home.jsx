import { Button } from "@/components/ui/button";
import {
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  ShirtIcon,
  Star,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

const categoriesWithIcon = [
  {
    id: "men",
    label: "Men",
    icon: ShirtIcon,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "women",
    label: "Women",
    icon: CloudLightning,
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "kids",
    label: "Kids",
    icon: BabyIcon,
    color: "from-green-500 to-green-600",
  },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sort products by different criteria
  const featuredProducts = useMemo(() => {
    if (!productList) return [];
    return [...productList].filter((product) => product.isFeatured).slice(0, 8);
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Carousel */}
      <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600">
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
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {slide?.title || "Welcome to Our Store"}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8">
                    {slide?.description ||
                      "Discover amazing products at great prices"}
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3"
                    onClick={() => navigate("/shop/listing")}
                  >
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Welcome to Our Store
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                Discover amazing products at great prices
              </p>
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3"
                onClick={() => navigate("/shop/listing")}
              >
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
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 z-10 h-12 w-12 rounded-full shadow-lg"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextSlide}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 z-10 h-12 w-12 rounded-full shadow-lg"
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
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-white scale-125" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our wide range of products across different categories
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {categoriesWithIcon.map((categoryItem) => (
              <Card
                key={categoryItem.id}
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="cursor-pointer group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden"
              >
                <CardContent className="flex flex-col items-center justify-center p-8 relative">
                  <div
                    className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${categoryItem.color}`}
                  ></div>
                  <div
                    className={`p-4 rounded-full bg-gradient-to-r ${categoryItem.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <categoryItem.icon className="w-12 h-12 text-white" />
                  </div>
                  <span className="font-bold text-2xl text-gray-900 mb-2">
                    {categoryItem.label}
                  </span>
                  <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                    Explore Collection →
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  Featured Products
                </h2>
                <p className="text-xl text-gray-600">
                  Handpicked items just for you
                </p>
              </div>
              <Badge variant="secondary" className="px-4 py-2 text-lg">
                <Award className="w-5 h-5 mr-2" />
                Premium Selection
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {featuredProducts.map((productItem) => (
                <ShoppingProductTile
                  key={productItem._id}
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellingProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  Best Sellers
                </h2>
                <p className="text-xl text-gray-600">
                  Most loved by our customers
                </p>
              </div>
              <Badge variant="secondary" className="px-4 py-2 text-lg">
                <TrendingUp className="w-5 h-5 mr-2" />
                Popular Now
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {bestSellingProducts.map((productItem) => (
                <ShoppingProductTile
                  key={productItem._id}
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  New Arrivals
                </h2>
                <p className="text-xl text-gray-600">
                  Fresh products just arrived
                </p>
              </div>
              <Badge variant="secondary" className="px-4 py-2 text-lg">
                <Clock className="w-5 h-5 mr-2" />
                Just In
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {newArrivals.map((productItem) => (
                <ShoppingProductTile
                  key={productItem._id}
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={openDetailsDialog && productDetails !== null}
        setOpen={handleCloseDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;
