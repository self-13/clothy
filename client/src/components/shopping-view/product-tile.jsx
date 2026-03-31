import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { Star, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
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
  const lowStock = totalStock > 0 && totalStock < 10;
  const productImage = product?.images?.[0] || product?.image;

  const handleCardClick = () => {
    navigate(`/shop/product/${product?._id}`);
  };

  if (viewMode === "list") {
    return (
      <Card
        className="w-full transition-all duration-300 border-none rounded-none overflow-hidden cursor-pointer group bg-white border-b border-zinc-100 hover:bg-zinc-50"
        onClick={handleCardClick}
      >
        <div className="flex p-6">
          <div className="w-40 h-40 flex-shrink-0 relative overflow-hidden bg-zinc-50 border border-zinc-100">
            <img
              src={productImage}
              alt={product?.title}
              className="w-full h-full object-contain transition-all duration-500 transform group-hover:scale-110"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Sold Out</span>
              </div>
            )}
          </div>

          <div className="flex-1 px-8 flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
              {brandOptionsMap[product?.brand] || product?.brand}
            </p>
            <h3 className="text-xl font-bold text-black mb-3 group-hover:underline dec decoration-2 underline-offset-4">
              {product?.title}
            </h3>
            
            <div className="flex items-baseline gap-4">
              <span className="text-xl font-black text-black">
                ₹{hasSale ? product.salePrice : product?.price}
              </span>
              {hasSale && (
                <span className="text-sm text-zinc-400 line-through">₹{product.price}</span>
              )}
            </div>
          </div>

          <div className="flex items-center">
             <ArrowRight className="w-6 h-6 text-black transform group-hover:translate-x-2 transition-transform duration-300" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="w-full transition-all duration-500 border-none rounded-none overflow-hidden group bg-white cursor-pointer"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-zinc-50 overflow-hidden flex items-center justify-center p-8">
        <img
          src={productImage}
          alt={product?.title}
          className="w-full h-full object-contain transition-all duration-700 transform group-hover:scale-110"
        />
        
        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-black/5 transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`} />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isOutOfStock ? (
            <Badge className="bg-black text-white rounded-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              Sold Out
            </Badge>
          ) : hasSale ? (
            <Badge className="bg-white text-black border-2 border-black rounded-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              -{discountPercentage}%
            </Badge>
          ) : null}
        </div>

        {/* Quick Add logic remains if needed, but for now we follow ID page */}
      </div>

      <CardContent className="px-0 py-6 space-y-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">
              {brandOptionsMap[product?.brand] || product?.brand}
            </p>
            <h3 className="text-sm font-bold text-black uppercase tracking-tight line-clamp-1 group-hover:underline underline-offset-4 decoration-1">
              {product?.title}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-black">
              ₹{hasSale ? product.salePrice : product?.price}
            </p>
            {hasSale && (
              <p className="text-[10px] text-zinc-400 line-through">₹{product.price}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ShoppingProductTile;
