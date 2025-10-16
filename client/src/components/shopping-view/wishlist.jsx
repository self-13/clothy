import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWishlistItems,
  removeFromWishlist,
} from "@/store/shop/wishlist-slice";
import ShoppingProductTile from "../shopping-view/product-tile";
import { Button } from "../ui/button";
import { HeartOff } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { fetchProductDetails } from "@/store/shop/products-slice";

function ShoppingWishlist() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlistItems(user.id));
    }
  }, [dispatch, user]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(
      removeFromWishlist({
        userId: user.id,
        productId,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Removed from wishlist",
        });
      }
    });
  };

  const handleGetProductDetails = (productId) => {
    console.log("Fetching details for product ID:", productId);
    dispatch(fetchProductDetails(productId));
  };

  if (!wishlistItems?.items || wishlistItems.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
        <HeartOff className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4" />
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 text-center">
          Your wishlist is empty
        </h3>
        <p className="text-gray-600 text-center text-sm sm:text-base max-w-md">
          Save your favorite items here to easily find them later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {wishlistItems.items.map((item) => (
        <div key={item.productId} className="relative group">
          {/* FIX: Create a proper product object that ShoppingProductTile expects */}
          <ShoppingProductTile
            product={{
              _id: item.productId, // This is the crucial fix - map productId to _id
              image: item.image,
              title: item.title,
              price: item.price,
              salePrice: item.salePrice,
              category: item.category,
              brand: item.brand,
              averageReview: item.averageReview,
              totalStock: 10, // Default value since wishlist doesn't provide stock info
            }}
            handleGetProductDetails={handleGetProductDetails}
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-90 hover:opacity-100 transition-opacity duration-200 text-xs sm:text-sm h-8 sm:h-9"
            onClick={() => handleRemoveFromWishlist(item.productId)}
          >
            <HeartOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}

export default ShoppingWishlist;
