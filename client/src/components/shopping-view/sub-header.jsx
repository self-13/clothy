import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

function ShoppingSubheader({
  genderView,
  setGenderView,
  activeCategory,
  setActiveCategory,
  categories = [],
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedGender = localStorage.getItem("selectedGender");
    if (savedGender) {
      const displayGender = savedGender === "man" ? "MEN" : "WOMEN";
      setGenderView(displayGender);
      setActiveCategory(displayGender);
    }
  }, [setGenderView, setActiveCategory]);

  const handleGenderSelect = (gender) => {
    const storageGender = gender === "MEN" ? "man" : "woman";
    localStorage.setItem("selectedGender", storageGender);
    setGenderView(gender);
    setActiveCategory(gender);
    navigate(`/shop/listing?category=${storageGender}`);
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    const currentGender = localStorage.getItem("selectedGender") || "man";
    navigate(
      `/shop/listing?category=${currentGender}&subcategory=${category.toLowerCase()}`
    );
  };

  const currentDisplayGender = genderView;

  return (
    <div className="bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-zinc-200/80 sticky top-20 z-20 font-sans">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between py-3.5 gap-8">
          
          {/* Gender Segment Control */}
          <div className="flex items-center gap-1 bg-[#F4F3EE] p-1 rounded-sm border border-zinc-200/70">
            <button
              onClick={() => handleGenderSelect("MEN")}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] rounded-sm transition-all duration-200 active:scale-95 ${
                currentDisplayGender === "MEN"
                  ? "bg-[#121212] text-white shadow-sm"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Men
            </button>
            <button
              onClick={() => handleGenderSelect("WOMEN")}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] rounded-sm transition-all duration-200 active:scale-95 ${
                currentDisplayGender === "WOMEN"
                  ? "bg-[#121212] text-white shadow-sm"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Women
            </button>
          </div>

          {/* Subcategory Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none flex-1 justify-center py-1">
            {categories.slice(2).map((category) => {
              const isActive = activeCategory?.toLowerCase() === category.toLowerCase();
              return (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`whitespace-nowrap text-xs uppercase tracking-[0.14em] font-medium transition-all duration-200 px-3.5 py-1.5 rounded-sm active:scale-95 ${
                    isActive
                      ? "text-[#121212] font-semibold bg-white border border-zinc-300 shadow-xs"
                      : "text-zinc-500 hover:text-black hover:bg-black/5"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between py-2.5">
          <div className="flex items-center gap-1 bg-[#F4F3EE] p-0.5 rounded-sm border border-zinc-200/70">
            <button
              onClick={() => handleGenderSelect("MEN")}
              className={`px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] rounded-sm transition-all ${
                currentDisplayGender === "MEN"
                  ? "bg-[#121212] text-white"
                  : "text-zinc-600"
              }`}
            >
              Men
            </button>
            <button
              onClick={() => handleGenderSelect("WOMEN")}
              className={`px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] rounded-sm transition-all ${
                currentDisplayGender === "WOMEN"
                  ? "bg-[#121212] text-white"
                  : "text-zinc-600"
              }`}
            >
              Women
            </button>
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="text-xs uppercase tracking-[0.14em] font-semibold px-3 py-1.5 border border-zinc-300 bg-white rounded-sm flex items-center gap-1.5"
                aria-label="Filter categories"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>Categories</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-[#FAF9F6] border-t border-zinc-200 rounded-t-xl p-6">
              <div className="space-y-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block">
                  Select Category
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(2).map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        handleCategorySelect(category);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-xs uppercase tracking-[0.12em] font-medium p-3 rounded-sm text-left transition-colors ${
                        activeCategory?.toLowerCase() === category.toLowerCase()
                          ? "bg-[#121212] text-white"
                          : "bg-white border border-zinc-200 text-zinc-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

export default ShoppingSubheader;
