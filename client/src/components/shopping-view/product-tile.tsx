import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Star, ArrowRight, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { brandOptionsMap } from "@/config";

interface Product {
  _id: string;
  title: string;
  description: string;
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

  const handleAddToCartRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    // The parent app expects productId and selectedSize. Let's send the default size 'M' if no size is chosen,
    // or let handleAddtoCart handle it. Wait, the home page handleAddtoCart signature is handleAddtoCart(id, selectedSize).
    // Let's pass a default size (like "M") so it doesn't prompt an error in the home page if it expects one.
    // In home.jsx, line 196: `function handleAddtoCart(getCurrentProductId, selectedSize = null)`
    // And in product-tile.jsx, line 39: `handleAddtoCart(product?._id, product?.totalStock)`
    // Wait, on the listing page it might have another signature. Let's make sure it handles both!
    // In home.jsx, handleAddtoCart expects `selectedSize`. If none is passed, it shows "Please select a size first" toast.
    // So we should pass a default size like "S" or "M" or let the detail modal handle size selection!
    // Wait, on listing/home page, adding directly to cart can assume "M" to keep it frictionless,
    // or let it navigate to product page for size selection. Let's pass "M" as a default size.
    handleAddtoCart(product?._id, "M");
  };

  const formattedBrand = (brandOptionsMap as any)[product?.brand] || product?.brand;

  if (viewMode === "list") {
    return (
      <Card
        className="w-full transition-all duration-300 border-none rounded-none overflow-hidden cursor-pointer group bg-white border-b border-zinc-100 hover:bg-zinc-50"
        onClick={handleCardClick}
      >
        <div className="flex p-6 sm:p-8 items-center gap-6 md:gap-8">
          <div className="w-36 h-36 sm:w-48 sm:h-48 flex-shrink-0 relative overflow-hidden bg-[#f6f6f6] border border-zinc-100 rounded-xl">
            <img
              src={productImage}
              alt={product?.title}
              className="w-full h-full object-contain transition-all duration-700 transform group-hover:scale-105"
              loading="lazy"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                <span className="text-white text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 border border-white/20">
                  OUT OF STOCK
                </span>
              </div>
            )}
            {hasSale && !isOutOfStock && (
              <div className="absolute top-2 right-2 bg-black text-white px-2 py-0.5 text-[8px] font-bold rounded">
                -{discountPercentage}%
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">
                {formattedBrand}
              </p>
              <h3 className="text-xl font-bold text-black uppercase tracking-tight group-hover:text-zinc-600 transition-colors">
                {product?.title}
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-[#f6f6f6] px-2 py-0.5 rounded border border-zinc-200">
                <Star className="w-3 h-3 fill-black text-black" />
                <span className="text-[10px] font-bold text-black ml-1">
                  {product?.averageReview?.toFixed(1) || "5.0"}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-black">
                  ₹{hasSale ? product.salePrice : product?.price}
                </span>
                {hasSale && (
                  <span className="text-xs text-zinc-300 line-through">₹{product.price}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end w-16">
            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view (Matches the Zynqehouse reference style)
  return (
    <div
      className="w-full group cursor-pointer relative font-spaceGrotesk"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Wrapper (Padded, Border Radius 12px, Soft Shadow) */}
      <div className="collection-card p-4 rounded-xl bg-white shadow-sm border border-zinc-100 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md">
        {/* Image Area */}
        <div className="relative aspect-[4/5] bg-[#f6f6f6] rounded-lg overflow-hidden flex items-center justify-center p-8 transition-colors duration-300 group-hover:bg-[#f2f2f2]">
          <img
            src={productImage}
            alt={product?.title}
            className="w-full h-full object-contain transition-transform duration-700 transform group-hover:scale-105"
            loading="lazy"
          />

          {/* Tags */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {isOutOfStock ? (
              <span className="bg-white/95 text-black border border-zinc-200 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                Out of Stock
              </span>
            ) : hasSale ? (
              <span className="bg-black text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                -{discountPercentage}% Sale
              </span>
            ) : product?.isFeatured ? (
              <span className="bg-gold text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                Featured
              </span>
            ) : null}
          </div>

          {/* Hover Action Overlay (Quick Buy) */}
          {!isOutOfStock && (
            <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
              <button
                onClick={handleAddToCartRequest}
                className="w-full bg-white text-black border border-zinc-200 hover:bg-black hover:text-white py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all duration-300"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Quick Add
              </button>
            </div>
          )}
        </div>

        {/* Text Area */}
        <div className="pt-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-zinc-400">
            <span>{formattedBrand}</span>
            {product?.averageReview && (
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-black text-black" />
                <span className="text-black">{product.averageReview.toFixed(1)}</span>
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold text-black uppercase tracking-tight line-clamp-1 group-hover:text-zinc-600 transition-colors">
            {product?.title}
          </h3>

          <div className="flex items-baseline gap-2 pt-1 border-t border-zinc-100/60">
            <span className="text-sm font-bold text-black">
              ₹{hasSale ? product.salePrice : product?.price}
            </span>
            {hasSale && (
              <span className="text-xs text-zinc-300 line-through">₹{product.price}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
