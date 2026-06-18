import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowUpDownIcon, Grid3X3, List, Star, Filter } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProductFilter from "@/components/shopping-view/filter";
import Footer from "@/components/shopping-view/footer";

export default function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { productList, isLoading, pagination } = useSelector(
    (state: any) => state.shopProducts
  );
  const { cartItems } = useSelector((state: any) => state.shopCart);
  const { user } = useSelector((state: any) => state.auth);

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
  const brandParam = searchParams.get("brand");
  const colorParam = searchParams.get("color");
  const sizeParam = searchParams.get("size");
  const searchParam = searchParams.get("search");

  const getCurrentGender = () => {
    const gender = categoryParam || localStorage.getItem("selectedGender") || "man";
    if (gender === "men" || gender === "man") return "man";
    if (gender === "women" || gender === "woman") return "woman";
    return gender;
  };

  const [genderView, setGenderView] = useState(() => {
    const currentGender = getCurrentGender();
    return currentGender === "woman" ? "WOMEN" : "MEN";
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

  // Synchronous React state for filters to ensure checkbox checking/unchecking is 150% reliable
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  // Sync state filters from URL search params on mount or param changes (e.g. manual URL changes, back/forward navigation)
  useEffect(() => {
    const brand = searchParams.get("brand");
    const color = searchParams.get("color");
    const size = searchParams.get("size");

    const newFilters: Record<string, string[]> = {};
    if (brand) newFilters.brand = brand.split(",");
    if (color) newFilters.color = color.split(",");
    if (size) newFilters.size = size.split(",");

    const isSizeDifferent = JSON.stringify(newFilters.size) !== JSON.stringify(filters.size);
    const isBrandDifferent = JSON.stringify(newFilters.brand) !== JSON.stringify(filters.brand);
    const isColorDifferent = JSON.stringify(newFilters.color) !== JSON.stringify(filters.color);

    if (isSizeDifferent || isBrandDifferent || isColorDifferent) {
      setFilters(newFilters);
    }
  }, [searchParams]);

  const buildFilterParams = useMemo(() => {
    const filterParams: Record<string, string[]> = { isActive: ["true"] as any };
    const currentGender = getCurrentGender();
    
    if (currentGender) {
      filterParams.category = [currentGender];
    }
    if (subcategoryParam) {
      filterParams.subcategory = [subcategoryParam];
    }
    if (brandParam) {
      filterParams.brand = brandParam.split(",");
    }
    if (colorParam) {
      filterParams.color = colorParam.split(",");
    }
    if (sizeParam) {
      filterParams.size = sizeParam.split(",");
    }
    if (searchParam) {
      filterParams.search = [searchParam];
    }
    
    return filterParams;
  }, [categoryParam, subcategoryParam, brandParam, colorParam, sizeParam, searchParam]);

  const handleFilter = (sectionId: string, optionId: string) => {
    const currentParams = new URLSearchParams(searchParams);
    let sectionValues = currentParams.get(sectionId)?.split(",") || [];
    
    if (sectionValues.includes(optionId)) {
      sectionValues = sectionValues.filter((v) => v !== optionId);
    } else {
      sectionValues = [...sectionValues, optionId];
    }
    
    if (sectionValues.length > 0) {
      currentParams.set(sectionId, sectionValues.join(","));
    } else {
      currentParams.delete(sectionId);
    }
    
    // Update local state synchronously for instantaneous checkbox feedback
    const updatedFilters = { ...filters };
    if (sectionValues.length > 0) {
      updatedFilters[sectionId] = sectionValues;
    } else {
      delete updatedFilters[sectionId];
    }
    setFilters(updatedFilters);
    
    setSearchParams(currentParams);
  };

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

  // Synchronize category selection, sub-header UI states, and localStorage with URL changes
  useEffect(() => {
    const currentGender = getCurrentGender();
    const normalizedGenderDisplay = currentGender === "woman" ? "WOMEN" : "MEN";
    setGenderView(normalizedGenderDisplay);
    
    if (subcategoryParam) {
      setActiveCategory(subcategoryParam.toUpperCase());
    } else {
      setActiveCategory(normalizedGenderDisplay);
    }

    // Keep localStorage in sync so that subheader navigation links behave correctly
    localStorage.setItem("selectedGender", currentGender);
  }, [categoryParam, subcategoryParam]);

  useEffect(() => {
    setSort("most-selling");
    dispatch(resetProductDetails() as any);
  }, [categoryParam, subcategoryParam, dispatch]);

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
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("brand");
    currentParams.delete("color");
    currentParams.delete("size");
    setSearchParams(currentParams);
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
    const genderText = currentGender === "man" ? "men's" : "women's";
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
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="md:hidden flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 text-xs font-bold uppercase tracking-wider bg-white hover:border-black transition-colors duration-300">
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filter</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full max-w-xs bg-white p-6 overflow-y-auto">
                    <div className="pt-6">
                      <ProductFilter filters={filters} handleFilter={handleFilter} />
                    </div>
                  </SheetContent>
                </Sheet>

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

          {/* Catalog Layout */}
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 items-start">
            {/* Desktop Sidebar Filter */}
            <aside className="hidden md:block sticky top-32 bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
              <ProductFilter filters={filters} handleFilter={handleFilter} />
            </aside>

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
      </div>
      <Footer />
    </div>
  );
}
