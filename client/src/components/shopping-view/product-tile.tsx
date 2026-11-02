import React, { useState } from "react";
import { Star, Plus, Eye, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { brandOptionsMap } from "@/config";

interface Product {
  _id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand: string;
  price: number;
  salePrice?: number;
  images?: string[];
  image?: string;
  totalStock: number;
  averageReview?: number;
  isFeatured?: boolean;
}

interface ShoppingProductTileProps {
  product: Product;
  handleGetProductDetails?: (id: string) => void;
  handleAddtoCart: (id: string, size?: string) => void;
  viewMode?: "grid" | "list";
}

export default function ShoppingProductTile({
  product,
  handleAddtoCart,
  viewMode = "grid",
}: ShoppingProductTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const navigate = useNavigate();

  const hasSale = !!(product?.salePrice && product?.salePrice > 0 && product?.salePrice < product?.price);
  const discountPercentage = hasSale
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  const totalStock = product?.totalStock || 0;
  const isOutOfStock = totalStock === 0;
  const productImage = product?.images?.[0] || product?.image || "/placeholder.png";

  const handleCardClick = () => {
    navigate(`/shop/product/${product?._id}`);
  };

  const handleSeeProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/shop/product/${product?._id}`);
  };

  const formattedBrand = (brandOptionsMap as any)[product?.brand] || product?.brand;

  // List View Mode
  if (viewMode === "list") {
    return (
      <div
        onClick={handleCardClick}
        className="group w-full bg-white border-b border-zinc-200/60 p-4 sm:p-6 cursor-pointer flex flex-col sm:flex-row items-center gap-6 transition-colors hover:bg-[#FAF9F6]"
      >
        <div className="w-28 h-36 sm:w-36 sm:h-44 flex-shrink-0 bg-[#F4F3F0] rounded-sm overflow-hidden relative flex items-center justify-center p-3">
          <img
            src={productImage}
            alt={product?.title}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2 text-center sm:text-left">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            {formattedBrand}
          </p>
          <h3 className="font-serif text-lg text-[#121212] group-hover:text-zinc-600 transition-colors">
            {product?.title}
          </h3>
          <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
            <span className="text-sm font-semibold text-[#121212]">
              ₹{hasSale ? product.salePrice : product?.price}
            </span>
            {hasSale && (
              <span className="text-xs text-zinc-400 line-through">₹{product.price}</span>
            )}
            {hasSale && (
              <span className="text-[10px] font-medium text-emerald-800 uppercase tracking-wider">
                -{discountPercentage}% Off
              </span>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col items-center gap-3">
          <button
            onClick={handleSeeProduct}
            className="px-5 py-2.5 bg-[#121212] text-white hover:bg-zinc-800 text-xs font-medium uppercase tracking-[0.14em] rounded-sm transition-all active:scale-[0.97] flex items-center gap-2"
          >
            <span>See Product</span>
          </button>
        </div>
      </div>
    );
  }

  // Grid View Mode (Minimalist Editorial Aesthetic)
  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-col font-sans"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full bg-[#F4F3F0] rounded-sm overflow-hidden flex items-center justify-center p-6 sm:p-8">
        <img
          src={productImage}
          alt={product?.title}
          className="w-full h-full object-contain transition-transform duration-700 ease-luxury group-hover:scale-105"
          loading="lazy"
        />

        {/* Minimal Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="bg-white/95 text-zinc-700 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] font-medium rounded-sm border border-zinc-200/80">
              Sold Out
            </span>
          ) : hasSale ? (
            <span className="bg-[#121212] text-white px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] font-medium rounded-sm">
              Sale -{discountPercentage}%
            </span>
          ) : product?.isFeatured ? (
            <span className="bg-white/95 text-zinc-800 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] font-medium rounded-sm border border-zinc-200/80">
              Curated
            </span>
          ) : null}
        </div>

        {/* Tactile Hover See Product Button */}
        <div className="absolute bottom-3 left-3 right-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-luxury z-10">
          <button
            onClick={handleSeeProduct}
            className="w-full bg-[#121212] text-[#FAF9F6] hover:bg-black py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] flex items-center justify-center gap-2 rounded-sm shadow-sm transition-transform active:scale-[0.97]"
          >
            <span>See Product</span>
          </button>
        </div>
      </div>

      {/* Product Details Meta */}
      <div className="pt-3.5 pb-2 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          {formattedBrand}
        </p>
        
        <h3 className="font-serif text-sm sm:text-[15px] text-[#121212] group-hover:text-zinc-600 transition-colors line-clamp-1 leading-snug">
          {product?.title}
        </h3>

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-xs sm:text-sm font-semibold text-[#121212]">
            ₹{hasSale ? product.salePrice : product?.price}
          </span>
          {hasSale && (
            <span className="text-[11px] text-zinc-400 line-through">₹{product.price}</span>
          )}
        </div>
      </div>
    </div>
  );
}
