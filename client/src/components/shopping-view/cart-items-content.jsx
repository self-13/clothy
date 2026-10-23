import { Minus, Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction === "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) =>
            item.productId === getCartItem?.productId &&
            item.selectedSize === getCartItem?.selectedSize &&
            item.selectedColor === getCartItem?.selectedColor
        );

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          const availableStock = getCartItem?.stock || 0;

          if (getQuantity + 1 > availableStock) {
            toast({
              title: `Only ${availableStock} units available for size ${getCartItem?.selectedSize}`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
        selectedSize: getCartItem?.selectedSize,
        selectedColor: getCartItem?.selectedColor,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Shopping bag updated",
        });
      } else if (data?.payload?.message) {
        toast({
          title: data.payload.message,
          variant: "destructive",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId: getCartItem?.productId,
        selectedSize: getCartItem?.selectedSize,
        selectedColor: getCartItem?.selectedColor,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Item removed from bag",
        });
      } else if (data?.payload?.message) {
        toast({
          title: data.payload.message,
          variant: "destructive",
        });
      }
    });
  }

  const itemPrice =
    cartItem?.salePrice > 0 ? cartItem.salePrice : cartItem?.price;
  const itemTotal = (itemPrice * cartItem?.quantity).toFixed(2);

  return (
    <div className="flex gap-4 p-3 bg-white border border-zinc-200/70 rounded-sm font-sans transition-all">
      {/* Product Image */}
      <div className="w-20 h-24 bg-[#F4F3F0] rounded-xs flex-shrink-0 p-2 flex items-center justify-center overflow-hidden">
        <img
          src={
            cartItem?.image || cartItem?.images?.[0] || "/placeholder-image.jpg"
          }
          alt={cartItem?.title}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.src = "/placeholder-image.jpg";
          }}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-serif text-sm text-[#121212] line-clamp-1 leading-snug">
              {cartItem?.title}
            </h3>
            <button
              onClick={() => handleCartItemDelete(cartItem)}
              className="text-zinc-400 hover:text-black p-0.5 transition-colors"
              aria-label="Remove item"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Size / Color details */}
          <div className="flex items-center gap-2 mt-1 text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
            {cartItem?.selectedSize && <span>Size: {cartItem.selectedSize}</span>}
            {cartItem?.selectedSize && cartItem?.selectedColor && <span>•</span>}
            {cartItem?.selectedColor && <span>{cartItem.selectedColor}</span>}
          </div>
        </div>

        {/* Quantity Controls & Price */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center border border-zinc-200 rounded-sm h-7 bg-[#FAF9F6]">
            <button
              disabled={cartItem?.quantity === 1}
              onClick={() => handleUpdateQuantity(cartItem, "minus")}
              className="w-6 h-full flex items-center justify-center text-zinc-500 hover:text-black disabled:opacity-30 active:scale-95"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-xs font-semibold">{cartItem?.quantity}</span>
            <button
              onClick={() => handleUpdateQuantity(cartItem, "plus")}
              disabled={cartItem?.quantity >= (cartItem?.stock || 0)}
              className="w-6 h-full flex items-center justify-center text-zinc-500 hover:text-black disabled:opacity-30 active:scale-95"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <span className="text-xs font-semibold text-[#121212]">
            ₹{itemTotal}
          </span>
        </div>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
