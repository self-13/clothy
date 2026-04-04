import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { Star, ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
  viewMode = "grid",
}) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const hasSale = product?.salePrice > 0 && product?.salePrice < product?.price;
  const discountPercentage = hasSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const totalStock = product?.totalStock || 0;
  const isOutOfStock = totalStock === 0;
  const productImage = product?.images?.[0] || product?.image;

  const handleCardClick = () => {
    navigate(`/shop/product/${product?._id}`);
  };

  const handleQuickViewRequest = (e) => {
    e.stopPropagation();
    navigate(`/shop/product/${product?._id}`);
  };

  const handleAddToCartRequest = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    handleAddtoCart(product?._id, product?.totalStock);
  };

  if (viewMode === "list") {
    return (
      <Card
        className="w-full transition-all duration-700 border-none rounded-none overflow-hidden cursor-pointer group bg-white border-b border-zinc-100 hover:bg-zinc-50"
        onClick={handleCardClick}
      >
        <div className="flex p-8 sm:p-10">
          <div className="w-48 h-48 sm:w-64 sm:h-64 flex-shrink-0 relative overflow-hidden bg-[#f8f8f8] border border-zinc-100">
            <img
              src={productImage}
              alt={product?.title}
              className="w-full h-full object-contain transition-all duration-1000 transform group-hover:scale-105"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-white text-[10px] font-black uppercase tracking-[0.4em] transform -rotate-12 border border-white/30 px-4 py-1 text-center">ARCHIVE ONLY</span>
              </div>
            )}
            {hasSale && !isOutOfStock && (
              <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                -{discountPercentage}%
              </div>
            )}
          </div>

          <div className="flex-1 px-12 flex flex-col justify-center space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">
                {brandOptionsMap[product?.brand] || product?.brand}
              </p>
              <h3 className="text-3xl font-black text-black group-hover:text-zinc-800 transition-colors uppercase tracking-tighter leading-tight">
                {product?.title}
              </h3>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center bg-black text-white px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                {product?.averageReview?.toFixed(1) || "5.0"}
                <Star className="w-3 h-3 fill-white ml-2" />
              </div>
              <div className="h-4 w-[1px] bg-zinc-200" />
              <div className="flex items-baseline gap-4">
                <span className="text-2xl font-black text-black">
                  ₹{hasSale ? product.salePrice : product?.price}
                </span>
                {hasSale && (
                  <span className="text-sm text-zinc-300 line-through font-light">₹{product.price}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end w-24">
            <div className="w-12 h-12 rounded-full border border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all duration-500">
              <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors duration-500" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="w-full transition-all duration-700 border-none rounded-none overflow-hidden group bg-white cursor-pointer relative"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-[#fcfcfc] overflow-hidden flex items-center justify-center p-12 transition-all duration-700 group-hover:bg-[#f8f8f8]">
        <img
          src={productImage}
          alt={product?.title}
          className="w-full h-full object-contain transition-all duration-1000 transform group-hover:scale-110"
        />

        <div className={`absolute inset-0 bg-black/5 transition-all duration-700 opacity-0 group-hover:opacity-100`} />

        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {isOutOfStock ? (
            <div className="bg-white/90 backdrop-blur-md text-black border border-black/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] shadow-sm">
              ARCHIVE
            </div>
          ) : hasSale ? (
            <div className="bg-black text-white px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] shadow-xl">
              -{discountPercentage}% SALE
            </div>
          ) : null}
        </div>

        {/* Quick View Button */}
        {!isOutOfStock && (
          <div
            onClick={handleQuickViewRequest}
            className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          >
            <div className="w-full bg-white/95 backdrop-blur-xl py-4 text-center border border-black/5 shadow-2xl hover:bg-black hover:text-white transition-colors duration-500">
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Exploration Mode</span>
            </div>
          </div>
        )}

        {/* Add Icon - Top Right */}
        {!isOutOfStock && (
          <div
            onClick={handleAddToCartRequest}
            className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 z-10"
          >
            {/* <div className="w-10 h-10 bg-black flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-xl">
              <Plus className="w-5 h-5 stroke-[3px]" />
            </div> */}
          </div>
        )}
      </div>

      <CardContent className="px-0 py-8 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">
              {brandOptionsMap[product?.brand] || product?.brand}
            </p>
            <div className="h-[1px] w-4 bg-zinc-100" />
          </div>
          <h3 className="text-md font-bold text-black uppercase tracking-tight line-clamp-1 group-hover:underline underline-offset-[6px] decoration-1 transition-all duration-500">
            {product?.title}
          </h3>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1 border border-zinc-100 group-hover:border-zinc-200 transition-colors">
                <Star className="w-3 h-3 fill-black text-black" />
                <span className="text-[10px] font-black text-black">
                  {product?.averageReview?.toFixed(1) || "5.0"}
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Certified</span>
            </div>

            <div className="text-right flex items-baseline gap-3 pr-2">
              <p className="text-lg font-black text-black tracking-tighter">
                ₹{hasSale ? product.salePrice : product?.price}
              </p>
              {hasSale && (
                <p className="text-[11px] text-zinc-300 line-through font-light italic">₹{product.price}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ShoppingProductTile;
