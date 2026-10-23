import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowUpDownIcon, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import ShoppingSubheader from "@/components/shopping-view/sub-header";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
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

  const [filters, setFilters] = useState<Record<string, string[]>>({});

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
        toast({ title: "Item added to your shopping bag." });
      } else if (data?.payload?.message) {
        toast({ title: data.payload.message, variant: "destructive" });
      }
    });
  };

  useEffect(() => {
    const currentGender = getCurrentGender();
    const normalizedGenderDisplay = currentGender === "woman" ? "WOMEN" : "MEN";
    setGenderView(normalizedGenderDisplay);
    
    if (subcategoryParam) {
      setActiveCategory(subcategoryParam.toUpperCase());
    } else {
      setActiveCategory(normalizedGenderDisplay);
    }

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
    const genderText = currentGender === "man" ? "Men's Collection" : "Women's Collection";

    if (subcategoryParam) {
      const subcategoryText =
        subcategoryParam.charAt(0).toUpperCase() + subcategoryParam.slice(1);
      return `${genderText} — ${subcategoryText}`;
    }

    return genderText;
  };

  const activeFiltersCount = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#121212] font-sans pt-20">
      
      {/* Subheader */}
      <ShoppingSubheader
        genderView={genderView}
        setGenderView={setGenderView}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
      />

      <div className="flex-1">
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-16">
          
          {/* Header Section */}
          <div className="mb-10 pb-8 border-b border-zinc-200/70 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block">
                Seasonal Catalog
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#121212] font-normal tracking-tight">
                {getPageTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-xl leading-relaxed">
                Discover refined essentials engineered for everyday elegance, premium materials, and timeless silhouettes.
              </p>
            </div>

            {/* Controls Bar: Count, Filter Mobile, View Toggle, Sorting */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap w-full md:w-auto justify-between md:justify-end">
              <span className="text-xs uppercase tracking-[0.15em] font-medium text-zinc-400">
                {productList?.length || 0} Pieces
              </span>

              <div className="flex items-center gap-2.5">
                {/* Mobile Filter Sheet Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="md:hidden flex items-center gap-2 px-4 py-2 rounded-sm border border-zinc-300 text-xs font-semibold uppercase tracking-[0.14em] bg-white text-[#121212] active:scale-95 transition-transform">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Filter {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] max-w-xs bg-[#FAF9F6] p-6 overflow-y-auto">
                    <div className="pt-4">
                      <ProductFilter filters={filters} handleFilter={handleFilter} />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Grid / List View Toggle */}
                <div className="flex items-center bg-[#F4F3EE] border border-zinc-200/80 rounded-sm p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-xs transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-[#121212] shadow-xs"
                        : "text-zinc-400 hover:text-black"
                    }`}
                    aria-label="Grid layout"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-xs transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-[#121212] shadow-xs"
                        : "text-zinc-400 hover:text-black"
                    }`}
                    aria-label="List layout"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-sm border border-zinc-300 bg-white hover:border-black text-xs font-semibold uppercase tracking-[0.14em] text-[#121212] transition-colors active:scale-95">
                      <ArrowUpDownIcon className="w-3.5 h-3.5" />
                      <span>Sort</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-white border border-zinc-200 rounded-sm shadow-xl p-1 mt-1 animate-in fade-in-0 zoom-in-95 duration-150">
                    <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                      {sortOptions.map((sortItem) => (
                        <DropdownMenuRadioItem
                          value={sortItem.id}
                          key={sortItem.id}
                          className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-700 hover:bg-zinc-100 cursor-pointer p-2.5 rounded-sm"
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

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-8 pb-4 border-b border-zinc-200/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mr-2">
                Active:
              </span>
              {Object.keys(filters).map((categoryKey) =>
                filters[categoryKey].map((val) => (
                  <button
                    key={`${categoryKey}-${val}`}
                    onClick={() => handleFilter(categoryKey, val)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-300 rounded-sm text-xs text-[#121212] hover:border-black transition-colors"
                  >
                    <span>{val}</span>
                    <X className="w-3 h-3 text-zinc-400 hover:text-black" />
                  </button>
                ))
              )}
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-zinc-500 hover:text-black underline underline-offset-4 ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Catalog Layout: Sidebar + Products */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 lg:gap-14 items-start">
            
            {/* Desktop Sidebar Filter */}
            <aside className="hidden md:block sticky top-36 bg-white border border-zinc-200/70 rounded-sm p-6 shadow-xs">
              <ProductFilter filters={filters} handleFilter={handleFilter} />
            </aside>

            {/* Product Grid / List */}
            <div className="w-full">
              {isLoading && currentPage === 1 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
                      : "space-y-4"
                  }
                >
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="space-y-3">
                      <Skeleton className="aspect-[3/4] w-full rounded-sm bg-zinc-200/70" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-1/3 bg-zinc-200/70" />
                        <Skeleton className="h-4 w-2/3 bg-zinc-200/70" />
                        <Skeleton className="h-3 w-1/4 bg-zinc-200/70" />
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
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
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
                        <div className="flex justify-center items-center py-16">
                          <div className="animate-spin rounded-full h-7 w-7 border-2 border-black border-t-transparent"></div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-24 bg-white border border-dashed border-zinc-200 rounded-sm">
                      <h3 className="font-serif text-xl text-[#121212] mb-2">
                        No garments match your filters
                      </h3>
                      <p className="text-zinc-500 text-xs mb-6 max-w-xs mx-auto font-light leading-relaxed">
                        Try resetting your current filters or searching for another category.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="bg-[#121212] text-white hover:bg-black px-6 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-[0.14em] transition-all active:scale-95"
                      >
                        Reset Filters
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
