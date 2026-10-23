import { useNavigate } from "react-router-dom";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { ArrowRight, ShoppingBag } from "lucide-react";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  return (
    <SheetContent className="sm:max-w-md w-full flex flex-col bg-[#FAF9F6] border-l border-zinc-200/80 p-6 font-sans">
      <SheetHeader className="pb-4 border-b border-zinc-200/70">
        <SheetTitle className="font-serif text-2xl font-normal text-[#121212] flex items-center justify-between">
          <span>Shopping Bag</span>
          <span className="text-xs uppercase tracking-[0.16em] font-sans font-semibold text-zinc-400">
            {cartItems?.length || 0} {cartItems?.length === 1 ? "Item" : "Items"}
          </span>
        </SheetTitle>
      </SheetHeader>

      <div className="mt-6 space-y-4 flex-1 overflow-y-auto pr-1">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <UserCartItemsContent key={item._id || item.productId} cartItem={item} />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="font-serif text-lg text-[#121212]">Your shopping bag is empty</p>
              <p className="text-xs text-zinc-400 font-light mt-1">Discover curated pieces in our latest collection.</p>
            </div>
          </div>
        )}
      </div>

      {cartItems && cartItems.length > 0 && (
        <div className="mt-auto pt-6 border-t border-zinc-200/80 space-y-4 bg-[#FAF9F6]">
          <div className="space-y-1.5 text-xs text-zinc-500">
            <div className="flex justify-between items-center text-sm font-semibold text-[#121212]">
              <span>Estimated Subtotal</span>
              <span>₹{totalCartAmount.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-light">Taxes & complimentary shipping calculated at checkout.</p>
          </div>

          <button
            onClick={() => {
              navigate("/shop/checkout");
              setOpenCartSheet(false);
            }}
            className="w-full h-12 bg-[#121212] hover:bg-black text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] rounded-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;
