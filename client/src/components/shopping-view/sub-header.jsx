import { Shirt, Heart, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";

function ShoppingSubheader({
  genderView,
  setGenderView,
  activeCategory,
  setActiveCategory,
  categories = [],
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between py-4">
          {/* Gender Toggle Slider */}
          <div className="flex items-center space-x-6">
            <div className="bg-gray-100 rounded-full p-1 flex border border-gray-200">
              <button
                onClick={() => {
                  setGenderView("MEN");
                  setActiveCategory("MEN");
                }}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  genderView === "MEN"
                    ? "bg-black text-white shadow-md border border-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <Shirt className="w-4 h-4" />
                <span>MEN</span>
              </button>
              <button
                onClick={() => {
                  setGenderView("WOMEN");
                  setActiveCategory("WOMEN");
                }}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  genderView === "WOMEN"
                    ? "bg-black text-white shadow-md border border-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>WOMEN</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>
          </div>

          {/* Category Links with Black & White Styling */}
          <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide flex-1 justify-center">
            {categories.slice(2).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                  activeCategory === category
                    ? "text-white font-bold bg-black border border-black"
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between py-3">
          {/* Gender Toggle - Simplified for mobile */}
          <div className="bg-gray-100 rounded-full p-1 flex border border-gray-200">
            <button
              onClick={() => {
                setGenderView("MEN");
                setActiveCategory("MEN");
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center space-x-1 ${
                genderView === "MEN"
                  ? "bg-black text-white shadow-md border border-black"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <Shirt className="w-3 h-3" />
              <span>MEN</span>
            </button>
            <button
              onClick={() => {
                setGenderView("WOMEN");
                setActiveCategory("WOMEN");
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center space-x-1 ${
                genderView === "WOMEN"
                  ? "bg-black text-white shadow-md border border-black"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>WOMEN</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 border border-gray-200"
              >
                <Menu className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Categories</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-white">
              <div className="flex flex-col h-full pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">
                  Categories
                </h3>
                <div className="flex-1 space-y-2">
                  {categories.slice(2).map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setActiveCategory(category);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeCategory === category
                          ? "text-white font-bold bg-black border border-black"
                          : "text-gray-600 hover:text-black hover:bg-gray-50"
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

        {/* Mobile Horizontal Scroll for Categories - Alternative option */}
        {/* Uncomment if you prefer horizontal scroll instead of sheet */}
        {/*
        <div className="md:hidden pb-3 -mt-2">
          <div className="flex space-x-3 overflow-x-auto scrollbar-hide px-1 py-2">
            {categories.slice(2).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap text-xs font-medium transition-all duration-200 px-3 py-2 rounded-lg flex-shrink-0 ${
                  activeCategory === category
                    ? "text-white font-bold bg-black border border-black"
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        */}
      </div>
    </div>
  );
}

export default ShoppingSubheader;
