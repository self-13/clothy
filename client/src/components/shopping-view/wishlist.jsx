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
      <div className="flex flex-col items-center justify-center py-12">
        <HeartOff className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
        <p className="text-muted-foreground text-center">
          Save your favorite items here to easily find them later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {wishlistItems.items.map((item) => (
        <div key={item.productId} className="relative">
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
            className="absolute top-2 right-2 opacity-90 hover:opacity-100"
            onClick={() => handleRemoveFromWishlist(item.productId)}
          >
            <HeartOff className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}

export default ShoppingWishlist;
