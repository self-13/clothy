import { Shirt, Heart, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

function ShoppingSubheader({
  genderView,
  setGenderView,
  activeCategory,
  setActiveCategory,
  categories = [],
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Initialize gender from localStorage on component mount
  useEffect(() => {
    const savedGender = localStorage.getItem("selectedGender");
    console.log(
      "🔄 Subheader - Loading gender from localStorage:",
      savedGender
    );

    if (savedGender) {
      // Convert localStorage value ("man"/"woman") to display format ("MEN"/"WOMEN")
      const displayGender = savedGender === "man" ? "MEN" : "WOMEN";
      setGenderView(displayGender);
      setActiveCategory(displayGender);
    }
  }, [setGenderView, setActiveCategory]);

  // Function to handle gender selection
  const handleGenderSelect = (gender) => {
    console.log("🎯 Gender selected:", gender);

    // Convert to lowercase for localStorage
    const storageGender = gender === "MEN" ? "man" : "woman";

    // Save to localStorage with consistent key
    localStorage.setItem("selectedGender", storageGender);
    console.log("💾 Saved to localStorage:", storageGender);

    // Update state
    setGenderView(gender);
    setActiveCategory(gender);

    // Navigate to listing page with the selected gender and reload
    // navigate(`/shop/listing?category=${storageGender}`);

    // Reload the page after a short delay to ensure navigation happens
    setTimeout(() => {
      console.log("🔄 Reloading page...");
      window.location.reload();
    }, 100);
  };

  // Function to handle category selection (non-gender categories)
  const handleCategorySelect = (category) => {
    setActiveCategory(category);

    // Get current gender from localStorage
    const currentGender = localStorage.getItem("selectedGender") || "man";
    console.log(
      "📁 Category selected:",
      category,
      "with gender:",
      currentGender
    );

    // Navigate to listing page with gender as category and clicked category as subcategory
    navigate(
      `/shop/listing?category=${currentGender}&subcategory=${category.toLowerCase()}`
    );
  };

  // Convert localStorage gender to display format
  const getDisplayGender = () => {
    const savedGender = localStorage.getItem("selectedGender");
    return savedGender === "man"
      ? "MEN"
      : savedGender === "woman"
      ? "WOMEN"
      : "MEN";
  };

  const currentDisplayGender = getDisplayGender();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between py-4">
          {/* Gender Toggle Slider */}
          <div className="flex items-center space-x-6">
            <div className="bg-gray-100 rounded-full p-1 flex border border-gray-200">
              <button
                onClick={() => handleGenderSelect("MEN")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  currentDisplayGender === "MEN"
                    ? "bg-black text-white shadow-md border border-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <Shirt className="w-4 h-4" />
                <span>MEN</span>
              </button>
              <button
                onClick={() => handleGenderSelect("WOMEN")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  currentDisplayGender === "WOMEN"
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
                onClick={() => handleCategorySelect(category)}
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
              onClick={() => handleGenderSelect("MEN")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center space-x-1 ${
                currentDisplayGender === "MEN"
                  ? "bg-black text-white shadow-md border border-black"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <Shirt className="w-3 h-3" />
              <span>MEN</span>
            </button>
            <button
              onClick={() => handleGenderSelect("WOMEN")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center space-x-1 ${
                currentDisplayGender === "WOMEN"
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
                        handleCategorySelect(category);
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
      </div>
    </div>
  );
}

export default ShoppingSubheader;
