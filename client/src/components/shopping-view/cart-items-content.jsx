import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { Badge } from "../ui/badge";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) =>
            item.productId === getCartItem?.productId &&
            item.selectedSize === getCartItem?.selectedSize &&
            item.selectedColor === getCartItem?.selectedColor
        );

        // Check stock availability
        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          const availableStock = getCartItem?.stock || 0;

          if (getQuantity + 1 > availableStock) {
            toast({
              title: `Only ${availableStock} quantity available for ${getCartItem?.selectedSize} size`,
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
          title: "Cart item updated successfully",
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
          title: "Item removed from cart",
        });
      } else if (data?.payload?.message) {
        toast({
          title: data.payload.message,
          variant: "destructive",
        });
      }
    });
  }

  // Calculate item total
  const itemPrice =
    cartItem?.salePrice > 0 ? cartItem.salePrice : cartItem?.price;
  const itemTotal = (itemPrice * cartItem?.quantity).toFixed(2);

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
      {/* Product Image */}
      <img
        src={
          cartItem?.image || cartItem?.images?.[0] || "/placeholder-image.jpg"
        }
        alt={cartItem?.title}
        className="w-20 h-20 rounded object-cover border"
        onError={(e) => {
          e.target.src = "/placeholder-image.jpg";
        }}
      />

      <div className="flex-1 min-w-0">
        {/* Product Title */}
        <h3 className="font-bold text-gray-900 truncate">{cartItem?.title}</h3>

        {/* Size and Color */}
        <div className="flex flex-wrap gap-2 mt-1">
          {cartItem?.selectedSize && (
            <Badge variant="outline" className="text-xs">
              Size: {cartItem.selectedSize}
            </Badge>
          )}
          {cartItem?.selectedColor && (
            <Badge variant="outline" className="text-xs">
              Color: {cartItem.selectedColor}
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-gray-900">₹{itemPrice}</span>
          {cartItem?.salePrice > 0 && (
            <span className="text-sm text-gray-500 line-through">
              ₹{cartItem?.price}
            </span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full p-0"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-3 h-3" />
          </Button>

          <span className="font-semibold text-lg min-w-8 text-center">
            {cartItem?.quantity}
          </span>

          <Button
            variant="outline"
            className="h-8 w-8 rounded-full p-0"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
            disabled={cartItem?.quantity >= (cartItem?.stock || 0)}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Total and Delete */}
      <div className="flex flex-col items-end gap-2">
        <div className="text-right">
          <div className="text-sm text-gray-500">Total</div>
          <div className="font-bold text-lg">₹{itemTotal}</div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleCartItemDelete(cartItem)}
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
