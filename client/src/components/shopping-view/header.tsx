import React, { useEffect, useState } from "react";
import { LogOut, ShoppingBag, User, X, Menu } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { fetchCartItems, addToCart } from "@/store/shop/cart-slice";

interface MenuItemsProps {
  onItemClick?: () => void;
  isTransparent?: boolean;
}

function MenuItems({ onItemClick, isTransparent }: MenuItemsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem: { id: string; label: string; path: string }) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    if (location.pathname.includes("listing") && currentFilter !== null) {
      setSearchParams(new URLSearchParams(`?category=${getCurrentMenuItem.id}`));
    } else {
      navigate(getCurrentMenuItem.path);
    }

    if (onItemClick) {
      onItemClick();
    }
  }

  return (
    <nav className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
      {shoppingViewHeaderMenuItems
        .filter((menuItem) => menuItem.id !== "search")
        .map((menuItem) => (
          <button
            key={menuItem.id}
            onClick={() => handleNavigate(menuItem)}
            className={`text-xs uppercase tracking-[0.18em] font-medium transition-colors duration-200 relative group py-1 text-left ${
              isTransparent
                ? "text-white/85 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            {menuItem.label}
            <span
              className={`absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full ${
                isTransparent ? "bg-white" : "bg-[#121212]"
              }`}
            />
          </button>
        ))}
    </nav>
  );
}

interface UserMenuProps {
  user: any;
  handleLogout: () => void;
  navigate: ReturnType<typeof useNavigate>;
  isTransparent?: boolean;
}

function UserMenu({ user, handleLogout, navigate, isTransparent }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2.5 p-1 rounded-full transition-transform active:scale-95 ${
            isTransparent ? "text-white" : "text-[#121212]"
          }`}
          aria-label="User account menu"
        >
          <Avatar className="h-8 w-8 rounded-full border border-zinc-300/80 bg-zinc-100">
            <AvatarFallback className="bg-transparent text-[#121212] font-semibold text-xs font-sans">
              {user?.userName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block text-xs font-medium uppercase tracking-[0.12em]">
            {user?.userName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white border border-zinc-200/90 rounded-sm shadow-xl p-1.5 mt-2 animate-in fade-in-0 zoom-in-95 duration-150"
      >
        <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 px-3 py-2">
          Signed In As <span className="text-black block font-bold text-xs normal-case">{user?.userName}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-100" />
        <DropdownMenuItem
          onClick={() => navigate("/shop/account")}
          className="rounded-sm cursor-pointer text-xs font-medium uppercase tracking-[0.12em] py-2.5 px-3 flex items-center gap-2.5 hover:bg-zinc-100/70"
        >
          <User className="h-3.5 w-3.5 text-zinc-500" /> Account Overview
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-sm cursor-pointer text-xs font-medium uppercase tracking-[0.12em] py-2.5 px-3 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ShoppingHeader() {
  const { user } = useSelector((state: any) => state.auth);
  const { cartItems } = useSelector((state: any) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const isHome = location.pathname === "/shop/home" || location.pathname === "/";

  function handleLogout() {
    dispatch(logoutUser() as any);
  }

  useEffect(() => {
    const syncAndFetchCart = async () => {
      if (user?.id) {
        const storedCart = localStorage.getItem("guestCart");
        if (storedCart) {
          try {
            const guestCart = JSON.parse(storedCart);
            if (guestCart && guestCart.items && guestCart.items.length > 0) {
              for (const item of guestCart.items) {
                await dispatch(
                  addToCart({
                    userId: user.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    selectedSize: item.selectedSize,
                    selectedColor: item.selectedColor,
                  }) as any
                );
              }
              localStorage.removeItem("guestCart");
            }
          } catch (e) {
            console.error("Error syncing guest cart:", e);
          }
        }
        dispatch(fetchCartItems(user.id) as any);
      } else {
        dispatch(fetchCartItems(undefined) as any);
      }
    };

    syncAndFetchCart();
  }, [dispatch, user?.id]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isHome && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center ${
          isTransparent
            ? "bg-transparent text-white"
            : "bg-[#FAF9F6]/95 backdrop-blur-md border-b border-zinc-200/70 text-[#121212] shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-6">
          
          {/* Left: Mobile Menu & Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 transition-transform active:scale-95"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 stroke-[1.8]" />
            </button>

            <Link
              to="/shop/home"
              className="flex items-center gap-3 transition-opacity hover:opacity-85"
            >
              <span className={`font-serif text-xl sm:text-2xl tracking-[0.16em] uppercase font-medium ${
                isTransparent ? "text-white" : "text-[#121212]"
              }`}>
                LUXERIDGE
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <MenuItems isTransparent={isTransparent} />
          </div>

          {/* Right: Actions (Cart, User) */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Shopping Bag Trigger */}
            <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
              <button
                onClick={() => setOpenCartSheet(true)}
                className={`relative p-2 transition-transform active:scale-95 rounded-full hover:bg-black/5 ${
                  isTransparent ? "hover:bg-white/10 text-white" : "text-[#121212]"
                }`}
                aria-label="Open shopping bag"
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                {cartItems?.items?.length > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center ${
                    isTransparent
                      ? "bg-white text-black"
                      : "bg-[#121212] text-white"
                  }`}>
                    {cartItems.items.length}
                  </span>
                )}
              </button>
              <UserCartWrapper
                setOpenCartSheet={setOpenCartSheet}
                cartItems={cartItems?.items?.length > 0 ? cartItems.items : []}
              />
            </Sheet>

            {/* User Profile or Sign In */}
            {user ? (
              <UserMenu
                user={user}
                handleLogout={handleLogout}
                navigate={navigate}
                isTransparent={isTransparent}
              />
            ) : (
              <button
                onClick={() => navigate("/auth/login")}
                className={`text-xs uppercase tracking-[0.14em] font-semibold py-2 px-4 transition-all duration-200 active:scale-95 rounded-sm ${
                  isTransparent
                    ? "bg-white text-[#121212] hover:bg-white/90"
                    : "bg-[#121212] text-[#FAF9F6] hover:bg-zinc-800"
                }`}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm bg-[#FAF9F6] border-r border-zinc-200 p-0 flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-zinc-200/80 flex justify-between items-center">
              <span className="font-serif text-xl tracking-[0.15em] uppercase font-medium">LUXERIDGE</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-zinc-500 hover:text-black"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-400 mb-2">Navigation</p>
              <MenuItems onItemClick={() => setMobileMenuOpen(false)} isTransparent={false} />
            </div>
          </div>

          <div className="p-6 border-t border-zinc-200/80 bg-white space-y-3">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-zinc-200">
                    <AvatarFallback className="font-semibold text-xs bg-zinc-100 text-black">
                      {user?.userName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Signed in</span>
                    <span className="text-sm font-semibold text-[#121212]">{user?.userName}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      navigate("/shop/account");
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold uppercase tracking-wider text-center rounded-sm"
                  >
                    Account
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider text-center rounded-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate("/auth/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-[#121212] text-white text-xs font-semibold uppercase tracking-[0.15em] text-center rounded-sm"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
