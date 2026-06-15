import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowUpDownIcon, Grid3X3, List, Star } from "lucide-react";
import ShoppingSubheader from "@/components/shopping-view/sub-header";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchAllFilteredProducts, resetProductDetails } from "@/store/shop/products-slice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Footer from "@/components/shopping-view/footer";

function createSearchParamsHelper(filterParams: Record<string, string[]>) {
  const queryParams: string[] = [];
  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }
  return queryParams.join("&");
}

export default function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { productList, isLoading, pagination } = useSelector(
    (state: any) => state.shopProducts
  );
  const { cartItems } = useSelector((state: any) => state.shopCart);
  const { user } = useSelector((state: any) => state.auth);

  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState("most-selling");
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination?.hasNext) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, pagination?.hasNext]
  );

  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");

  const [genderView, setGenderView] = useState(() => {
    if (categoryParam) {
      return categoryParam.toUpperCase();
    }
    const savedGender = localStorage.getItem("selectedGender");
    return savedGender ? savedGender.toUpperCase() : "MEN";
  });

  const [activeCategory, setActiveCategory] = useState("");

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

  const getCurrentGender = () => {
    return localStorage.getItem("selectedGender") || "men";
  };

  const buildFilterParams = useMemo(() => {
    const filterParams: Record<string, string[]> = { ...filters, isActive: ["true"] as any };
    const currentGender = getCurrentGender();
    if (currentGender) {
      filterParams.category = [currentGender];
    }
    if (subcategoryParam) {
      filterParams.subcategory = [subcategoryParam];
    }
    return filterParams;
  }, [filters, subcategoryParam]);

  const handleSort = (value: string) => {
    setSort(value);
  };

  const handleAddtoCart = (productId: string, size = "M") => {
    dispatch(
      addToCart({
        productId,
        quantity: 1,
        selectedSize: size,
      }) as any
    ).then((data: any) => {
      if (data?.payload?.success) {
        if (user?.id) dispatch(fetchCartItems(user.id) as any);
        toast({ title: "Product added to cart successfully!" });
      } else if (data?.payload?.message) {
        toast({ title: data.payload.message, variant: "destructive" });
      }
    });
  };

  useEffect(() => {
    setSort("most-selling");
    const savedFilters = sessionStorage.getItem("filters");
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
    dispatch(resetProductDetails() as any);
  }, [categoryParam, subcategoryParam, dispatch]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters, setSearchParams]);

  useEffect(() => {
    setCurrentPage(1);
    dispatch(
      fetchAllFilteredProducts({
        filterParams: buildFilterParams,
        sortParams: sort,
        page: 1,
      }) as any
    );
  }, [dispatch, sort, buildFilterParams]);

  useEffect(() => {
    if (currentPage > 1) {
      dispatch(
        fetchAllFilteredProducts({
          filterParams: buildFilterParams,
          sortParams: sort,
          page: currentPage,
        }) as any
      );
    }
  }, [dispatch, currentPage, buildFilterParams, sort]);

  const clearFilters = () => {
    setFilters({});
    sessionStorage.removeItem("filters");
    setSearchParams(new URLSearchParams());
  };

  const getPageTitle = () => {
    const currentGender = getCurrentGender();
    const genderText = currentGender === "man" ? "Men's" : "Women's";

    if (subcategoryParam) {
      const subcategoryText =
        subcategoryParam.charAt(0).toUpperCase() + subcategoryParam.slice(1);
      return `${subcategoryText} // ${genderText}`;
    }

    return `${genderText} Anthology`;
  };

  const getPageDescription = () => {
    const currentGender = getCurrentGender();
    const genderText = currentGender === "men" ? "men's" : "women's";
    return `Discover our complete collection of curated fashion pieces crafted for ${genderText}.`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-spaceGrotesk pt-20">
      
      {/* Dynamic Subheader */}
      <ShoppingSubheader
        genderView={genderView}
        setGenderView={setGenderView}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
      />

      <div className="flex-1 bg-white">
        <div className="container mx-auto px-4 md:px-8 py-12">
          
          {/* Header Description Section */}
          <div className="mb-12 border-b border-zinc-100 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">*CATALOG</p>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-black">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">{getPageDescription()}</p>
            </div>

            {/* View Mode & Sorting Control */}
            <div className="flex items-center gap-4 flex-wrap w-full md:w-auto justify-between md:justify-end">
              
              {/* Product Count */}
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {productList?.length || 0} Products
              </span>

              <div className="flex items-center gap-3">
                {/* View Mode buttons */}
                <div className="flex bg-[#f8f8f8] border border-zinc-200 rounded-full p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      viewMode === "grid" ? "bg-black text-white" : "text-zinc-400 hover:text-black"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      viewMode === "list" ? "bg-black text-white" : "text-zinc-400 hover:text-black"
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sorting Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 text-xs font-bold uppercase tracking-wider bg-white hover:border-black transition-colors duration-300">
                      <ArrowUpDownIcon className="w-3.5 h-3.5" />
                      <span>Sort By</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px] bg-white border border-zinc-200 rounded-xl shadow-lg mt-2">
                    <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                      {sortOptions.map((sortItem) => (
                        <DropdownMenuRadioItem
                          value={sortItem.id}
                          key={sortItem.id}
                          className="text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 cursor-pointer focus:bg-zinc-50 focus:text-black p-3"
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

          {/* Catalog grid */}
          <div className="w-full">
            {isLoading && currentPage === 1 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="space-y-4">
                    <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {productList && productList.length > 0 ? (
                  <>
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                          : "space-y-4"
                      }
                    >
                      {productList.map((productItem: any, index: number) => {
                        const isLast = productList.length === index + 1;
                        return (
                          <div
                            ref={isLast ? lastProductElementRef : null}
                            key={productItem._id}
                          >
                            <ShoppingProductTile
                              product={productItem}
                              handleAddtoCart={handleAddtoCart}
                              viewMode={viewMode}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Infinite Scroll loading indicator */}
                    {isLoading && currentPage > 1 && (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-24 border border-dashed border-zinc-200 rounded-3xl">
                    <div className="text-zinc-400 text-lg mb-2 uppercase font-bold tracking-tight">
                      No products found
                    </div>
                    <p className="text-zinc-500 text-xs mb-6 max-w-xs mx-auto leading-relaxed">
                      Try adjusting your search criteria or clearing filters.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-black text-white hover:bg-zinc-800 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
