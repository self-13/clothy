import { Shirt, Heart } from "lucide-react";

function ShoppingSubheader({ 
  genderView, 
  setGenderView, 
  activeCategory, 
  setActiveCategory,
  categories = []
}) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
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
            <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
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
      </div>
    </div>
  );
}

export default ShoppingSubheader;