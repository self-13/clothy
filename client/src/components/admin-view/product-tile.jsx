// components/admin-view/product-tile.jsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Star } from "lucide-react";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const mainImage = product.images?.[0] || product.image;

  return (
    <div className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        {product.images && product.images.length > 1 && (
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
            +{product.images.length - 1}
          </Badge>
        )}
        {!product.isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="destructive" className="text-xs">
              Inactive
            </Badge>
          </div>
        )}
        {product.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-xs">
            Featured
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm line-clamp-2 flex-1">
            {product.title}
          </h3>
          <Badge variant="outline" className="text-xs ml-2 shrink-0">
            {product.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-bold">₹{product.price}</span>
            {product.salePrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.salePrice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs">{product.averageReview || 0}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {product.subcategory}
          </Badge>
          {product.colors?.slice(0, 2).map((color, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {color}
            </Badge>
          ))}
          {product.colors && product.colors.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{product.colors.length - 2}
            </Badge>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Stock: {product.totalStock}</span>
          <span>Sales: {product.salesCount || 0}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              setCurrentEditedId(product._id);
              setOpenCreateProductsDialog(true);
            }}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(product._id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminProductTile;
