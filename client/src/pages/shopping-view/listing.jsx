import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ShoppingSubheader from "@/components/shopping-view/sub-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
  resetProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon, FilterIcon, Grid3X3, List } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join("&");
}

function ShoppingListing() {
  const dispatch = useDispatch();
  const { productList, productDetails, isLoading } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("most-selling");
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [genderView, setGenderView] = useState("MEN");
  const [activeCategory, setActiveCategory] = useState("");
  const { toast } = useToast();

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

  const categorySearchParam = searchParams.get("category");

  function handleSort(value) {
    setSort(value);
  }

  function handleFilter(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };
    const indexOfCurrentSection = Object.keys(cpyFilters).indexOf(getSectionId);

    if (indexOfCurrentSection === -1) {
      cpyFilters = {
        ...cpyFilters,
        [getSectionId]: [getCurrentOption],
      };
    } else {
      const indexOfCurrentOption =
        cpyFilters[getSectionId].indexOf(getCurrentOption);

      if (indexOfCurrentOption === -1)
        cpyFilters[getSectionId].push(getCurrentOption);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
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

    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) =>
          item.productId === getCurrentProductId &&
          item.selectedSize === selectedSize
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        // Get product stock for the specific size
        const product = productList.find((p) => p._id === getCurrentProductId);
        const sizeStock =
          product?.sizes?.find((s) => s.size === selectedSize)?.stock || 0;

        if (getQuantity + 1 > sizeStock) {
          toast({
            title: `Only ${sizeStock} items available for this size`,
            variant: "destructive",
          });
          return;
        }
      }
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
    setSort("most-selling");
    const savedFilters = sessionStorage.getItem("filters");
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, [categorySearchParam]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters, setSearchParams]);

  useEffect(() => {
    if (filters !== null && sort !== null) {
      dispatch(
        fetchAllFilteredProducts({
          filterParams: { ...filters, isActive: true },
          sortParams: sort,
        })
      );
    }
  }, [dispatch, sort, filters]);

  useEffect(() => {
    if (productDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);

  // Clear filters function
  const clearFilters = () => {
    setFilters({});
    sessionStorage.removeItem("filters");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Subheader */}
      <ShoppingSubheader
        genderView={genderView}
        setGenderView={setGenderView}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
      />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">
              All Products
            </h1>
            <p className="text-lg text-gray-600">
              Discover our complete collection of amazing products
            </p>
          </div>

          <div className="flex flex-col">
            {/* Toolbar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-gray-700">
                    {productList?.length || 0} Products
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-300 rounded-lg p-1 bg-white">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={`h-8 w-8 p-0 ${
                        viewMode === "grid" 
                          ? "bg-black text-white hover:bg-gray-800" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={`h-8 w-8 p-0 ${
                        viewMode === "list" 
                          ? "bg-black text-white hover:bg-gray-800" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <ArrowUpDownIcon className="h-4 w-4" />
                        <span>Sort by</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-200">
                      <DropdownMenuRadioGroup
                        value={sort}
                        onValueChange={handleSort}
                      >
                        {sortOptions.map((sortItem) => (
                          <DropdownMenuRadioItem
                            value={sortItem.id}
                            key={sortItem.id}
                            className="text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            {sortItem.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            ) : (
              <>
                {productList && productList.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "space-y-4"
                    }
                  >
                    {productList.map((productItem) => (
                      <ShoppingProductTile
                        key={productItem._id}
                        handleGetProductDetails={handleGetProductDetails}
                        product={productItem}
                        handleAddtoCart={handleAddtoCart}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">
                      No products found
                    </div>
                    <p className="text-gray-500 mb-4">
                      {Object.keys(filters).length > 0
                        ? "Try adjusting your filters to see more products"
                        : "No products available at the moment"}
                    </p>
                    {Object.keys(filters).length > 0 && (
                      <Button 
                        onClick={clearFilters}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={openDetailsDialog && productDetails !== null}
        setOpen={handleCloseDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingListing;