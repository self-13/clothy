import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWishlistItems,
  removeFromWishlist,
} from "@/store/shop/wishlist-slice";
import ShoppingProductTile from "../shopping-view/product-tile";
import { Heart, X } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { fetchProductDetails } from "@/store/shop/products-slice";

function ShoppingWishlist() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlistItems());
    }
  }, [dispatch, user]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(
      removeFromWishlist({
        productId,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Removed from wishlist.",
        });
      }
    });
  };

  const handleGetProductDetails = (productId) => {
    dispatch(fetchProductDetails(productId));
  };

  if (!wishlistItems?.items || wishlistItems.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center font-sans space-y-3">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2">
          <Heart className="w-5 h-5 stroke-[1.5]" />
        </div>
        <h3 className="font-serif text-xl text-[#121212]">
          Your Wishlist is Empty
        </h3>
        <p className="text-zinc-500 text-xs font-light max-w-sm">
          Bookmark garments as you browse to revisit your curated selections here anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <div className="mb-6 pb-4 border-b border-zinc-200/70 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-xl text-[#121212]">Saved Garments</h3>
          <p className="text-xs text-zinc-400 font-light mt-0.5">
            {wishlistItems.items.length} {wishlistItems.items.length === 1 ? "Piece" : "Pieces"} in your archive
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {wishlistItems.items.map((item) => (
          <div key={item.productId} className="relative group">
            <ShoppingProductTile
              product={{
                _id: item.productId,
                image: item.image,
                title: item.title,
                price: item.price,
                salePrice: item.salePrice,
                category: item.category,
                brand: item.brand,
                averageReview: item.averageReview,
                totalStock: 10,
              }}
              handleGetProductDetails={handleGetProductDetails}
            />
            <button
              onClick={() => handleRemoveFromWishlist(item.productId)}
              className="absolute top-3 right-3 w-7 h-7 bg-white/95 rounded-full flex items-center justify-center text-zinc-400 hover:text-black shadow-xs opacity-0 group-hover:opacity-100 transition-opacity z-20"
              aria-label="Remove from wishlist"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShoppingWishlist;
