import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { Star, ShoppingCart, Eye } from "lucide-react";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
  viewMode = "grid",
}) {
  const hasSale = product?.salePrice > 0 && product?.salePrice < product?.price;
  const discountPercentage = hasSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  // Check stock availability
  const totalStock = product?.totalStock || 0;
  const isOutOfStock = totalStock === 0;
  const lowStock = totalStock > 0 && totalStock < 10;

  if (viewMode === "list") {
    return (
      <Card className="w-full hover:shadow-lg transition-all duration-300 group">
        <div className="flex flex-col sm:flex-row">
          {/* Product Image */}
          <div
            className="relative sm:w-48 md:w-56 h-48 sm:h-auto cursor-pointer flex-shrink-0"
            onClick={() => handleGetProductDetails(product?._id)}
          >
            <img
              src={product?.images?.[0] || product?.image}
              alt={product?.title}
              className="w-full h-full object-cover rounded-l-lg"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOutOfStock ? (
                <Badge className="bg-red-500 hover:bg-red-600 text-white">
                  Out Of Stock
                </Badge>
              ) : lowStock ? (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                  Only {totalStock} left
                </Badge>
              ) : hasSale ? (
                <Badge className="bg-red-500 hover:bg-red-600 text-white">
                  {discountPercentage}% OFF
                </Badge>
              ) : null}

              {product?.isFeatured && (
                <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div
                  className="cursor-pointer mb-3"
                  onClick={() => handleGetProductDetails(product?._id)}
                >
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {product?.title}
                  </h2>
                  <p className="text-gray-600 mt-2 line-clamp-2">
                    {product?.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                  <span>{categoryOptionsMap[product?.category]}</span>
                  <span>•</span>
                  <span>{brandOptionsMap[product?.brand]}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-gray-900">
                      {product?.averageReview?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    ({product?.salesCount || 0} sold)
                  </span>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-baseline gap-2">
                    {hasSale ? (
                      <>
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{product?.salePrice}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{product?.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{product?.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleGetProductDetails(product?._id)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleGetProductDetails(product?._id)}
                    disabled={isOutOfStock}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid View (default)
  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-xl transition-all duration-300 group border-0 bg-white shadow-sm">
      <div
        className="cursor-pointer"
        onClick={() => handleGetProductDetails(product?._id)}
      >
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product?.images?.[0] || product?.image}
            alt={product?.title}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOutOfStock ? (
              <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm">
                Out Of Stock
              </Badge>
            ) : lowStock ? (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-sm">
                Only {totalStock} left
              </Badge>
            ) : hasSale ? (
              <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm">
                {discountPercentage}% OFF
              </Badge>
            ) : null}

            {product?.isFeatured && (
              <Badge className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 text-sm">
                Featured
              </Badge>
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="secondary"
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                handleGetProductDetails(product?._id);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Quick View
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div
          className="cursor-pointer mb-3"
          onClick={() => handleGetProductDetails(product?._id)}
        >
          <h2 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
            {product?.title}
          </h2>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-sm text-gray-500">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-900">
                {product?.averageReview?.toFixed(1) || "0.0"}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              ({product?.salesCount || 0} sold)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {hasSale ? (
              <>
                <span className="text-xl font-bold text-gray-900">
                  ₹{product?.salePrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₹{product?.price}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-900">
                ₹{product?.price}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => handleGetProductDetails(product?._id)}
          disabled={isOutOfStock}
          className="w-full flex items-center gap-2"
          size="lg"
        >
          <ShoppingCart className="w-4 h-4" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
