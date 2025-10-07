import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { Star, ShoppingCart, Heart, Share2, Zap } from "lucide-react";
import { useState } from "react";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
  viewMode = "grid",
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasSale = product?.salePrice > 0 && product?.salePrice < product?.price;
  const discountPercentage = hasSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  // Check stock availability
  const totalStock = product?.totalStock || 0;
  const isOutOfStock = totalStock === 0;
  const lowStock = totalStock > 0 && totalStock < 10;

  const productImage = product?.images?.[0] || product?.image;

  if (viewMode === "list") {
    return (
      <Card className="w-full hover:shadow-md transition-all duration-200 border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex">
          {/* Product Image */}
          <div 
            className="w-48 h-48 flex-shrink-0 relative cursor-pointer"
            onClick={() => handleGetProductDetails(product?._id)}
          >
            <img
              src={productImage}
              alt={product?.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/placeholder-image.jpg";
              }}
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOutOfStock ? (
                <Badge className="bg-red-600 text-white border-0 px-2 py-1 text-xs font-normal">
                  Out of Stock
                </Badge>
              ) : lowStock ? (
                <Badge className="bg-orange-500 text-white border-0 px-2 py-1 text-xs font-normal">
                  Only {totalStock} left
                </Badge>
              ) : hasSale ? (
                <Badge className="bg-green-600 text-white border-0 px-2 py-1 text-xs font-normal">
                  {discountPercentage}% off
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 p-4">
            <div className="flex flex-col h-full">
              {/* Title and Brand */}
              <div className="mb-2">
                <h3 
                  className="text-lg font-normal text-gray-900 mb-1 cursor-pointer hover:text-blue-600 line-clamp-2"
                  onClick={() => handleGetProductDetails(product?._id)}
                >
                  {product?.title}
                </h3>
                <p className="text-sm text-gray-500">
                  by {brandOptionsMap[product?.brand] || product?.brand}
                </p>
              </div>

              {/* Rating */}
              {product?.averageReview && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center bg-green-700 text-white px-2 py-1 rounded text-xs">
                    <span className="font-medium">{product.averageReview.toFixed(1)}</span>
                    <Star className="w-3 h-3 fill-current ml-1" />
                  </div>
                  <span className="text-blue-600 text-sm cursor-pointer hover:underline">
                    {product?.reviewCount || 0} ratings
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{hasSale ? product.salePrice : product?.price}
                  </span>
                  {hasSale && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{product.price}
                      </span>
                      <span className="text-green-600 text-sm font-medium">
                        {discountPercentage}% off
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">Free delivery</p>
              </div>

              {/* Features */}
              <div className="mb-4">
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Premium quality material</li>
                  <li>• Comfortable fit</li>
                  <li>• Easy maintenance</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-auto">
                <Button
                  onClick={() => handleAddtoCart(product)}
                  disabled={isOutOfStock}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-yellow-400 text-sm font-medium px-6"
                >
                  Add to Cart
                </Button>
                <Button
                  onClick={() => handleGetProductDetails(product?._id)}
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-50 text-sm px-6"
                >
                  Buy Now
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`h-8 w-8 ${isWishlisted ? 'text-red-500' : 'text-gray-500'}`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid View (default) - Amazon/Flipkart style
  return (
    <Card 
      className="w-full max-w-xs hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-lg overflow-hidden group bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square bg-white p-4">
        <div 
          className="w-full h-full flex items-center justify-center cursor-pointer"
          onClick={() => handleGetProductDetails(product?._id)}
        >
          <img
            src={productImage}
            alt={product?.title}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
            }}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOutOfStock ? (
            <Badge className="bg-red-600 text-white border-0 px-2 py-1 text-xs font-normal">
              Out of Stock
            </Badge>
          ) : lowStock ? (
            <Badge className="bg-orange-500 text-white border-0 px-2 py-1 text-xs font-normal">
              Only {totalStock} left
            </Badge>
          ) : hasSale ? (
            <Badge className="bg-green-600 text-white border-0 px-2 py-1 text-xs font-normal">
              {discountPercentage}% off
            </Badge>
          ) : null}

          {product?.isFeatured && (
            <Badge className="bg-purple-600 text-white border-0 px-2 py-1 text-xs font-normal">
              <Zap className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`absolute top-3 right-3 h-8 w-8 bg-white border border-gray-300 rounded-full shadow-sm ${
            isWishlisted ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </Button>

        {/* Quick Actions on Hover */}
        {isHovered && (
          <div className="absolute bottom-3 left-3 right-3">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddtoCart(product);
              }}
              disabled={isOutOfStock}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium shadow-md"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <CardContent className="p-4 space-y-3">
        {/* Category */}
        {product?.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {categoryOptionsMap[product.category]}
          </p>
        )}

        {/* Title */}
        <h3 
          className="text-sm font-normal text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 leading-tight"
          onClick={() => handleGetProductDetails(product?._id)}
        >
          {product?.title}
        </h3>

        {/* Rating */}
        {product?.averageReview && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-green-700 text-white px-1.5 py-0.5 rounded text-xs">
              <span className="font-medium">{product.averageReview.toFixed(1)}</span>
              <Star className="w-3 h-3 fill-current ml-0.5" />
            </div>
            <span className="text-blue-600 text-xs cursor-pointer hover:underline">
              ({product?.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{hasSale ? product.salePrice : product?.price}
            </span>
            {hasSale && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.price}
              </span>
            )}
          </div>
          {hasSale && (
            <p className="text-green-600 text-xs font-medium">
              {discountPercentage}% off
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ShoppingProductTile;