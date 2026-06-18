import React, { useEffect, useState } from "react";
import { LogOut, ShoppingCart, UserCog, X, Menu } from "lucide-react";
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
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";

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
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-8 lg:flex-row">
      {shoppingViewHeaderMenuItems
        .filter((menuItem) => menuItem.id !== "search")
        .map((menuItem) => (
          <span
            onClick={() => handleNavigate(menuItem)}
            className={`text-[14px] font-medium uppercase tracking-[0.1em] cursor-pointer transition-all duration-300 relative group py-2 ${
              isTransparent ? "text-white/80 hover:text-white" : "text-zinc-600 hover:text-black"
            }`}
            key={menuItem.id}
          >
            {menuItem.label}
            <span className={`absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full ${
              isTransparent ? "bg-white" : "bg-black"
            }`} />
          </span>
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
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 leading-none">Account</p>
            <p className={`text-sm font-semibold uppercase tracking-tight ${
              isTransparent ? "text-white" : "text-black"
            }`}>{user?.userName}</p>
          </div>
          <Avatar className={`h-10 w-10 rounded-full border p-0.5 transition-all duration-300 ${
            isTransparent
              ? "border-white bg-transparent text-white group-hover:bg-white group-hover:text-black"
              : "border-black bg-white text-black group-hover:bg-black group-hover:text-white"
          }`}>
            <AvatarFallback className="bg-transparent text-inherit font-bold text-xs">
              {user?.userName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white border border-zinc-200 rounded-lg shadow-lg p-2 mt-2"
      >
        <DropdownMenuLabel className="text-black font-bold uppercase tracking-tight text-xs px-2 py-3 border-b border-zinc-100">
          PRO_FILE
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigate("/shop/account")}
          className="rounded-md focus:bg-zinc-100 cursor-pointer font-bold uppercase text-[10px] tracking-widest py-3 px-2 flex items-center gap-2 mt-1"
        >
          <UserCog className="h-4 w-4" /> Management
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-md focus:bg-red-50 focus:text-red-600 cursor-pointer font-bold uppercase text-[10px] tracking-widest py-3 px-2 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Terminate Session
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ShoppingHeader() {
  const { user } = useSelector((state: any) => state.auth);
  const { cartItems } = useSelector((state: any) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const isHome = location.pathname === "/shop/home";

  function handleLogout() {
    dispatch(logoutUser() as any);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop/listing?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id) as any);
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine transparent or solid styles
  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center ${
        isTransparent
          ? "bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 text-white"
          : "bg-white/90 backdrop-blur-xl border-b border-zinc-100 text-black shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-8">
        {/* Logo */}
        <Link
          to="/shop/home"
          className="flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <img src="/logo.png" alt="logo" className={`size-24 ${isTransparent ? "invert" : ""}`} />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:block">
          <MenuItems isTransparent={isTransparent} />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 md:gap-6">

          {/* Cart Trigger */}
          <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
            <button
              onClick={() => setOpenCartSheet(true)}
              className="relative hover:scale-110 transition-transform duration-300 p-2"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2]" />
              {cartItems?.items?.length > 0 && (
                <span className={`absolute -top-1 -right-1 font-bold text-[9px] rounded-full w-4 h-4 flex items-center justify-center transition-colors duration-300 ${
                  isTransparent
                    ? "bg-white text-black border border-transparent"
                    : "bg-black text-white border border-white"
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

          {/* User Profile / Login */}
          <div className="flex items-center">
            {user ? (
              <UserMenu user={user} handleLogout={handleLogout} navigate={navigate} isTransparent={isTransparent} />
            ) : (
              <Button
                onClick={() => navigate("/auth/login")}
                className={`rounded-full font-bold uppercase tracking-widest text-[10px] h-9 px-6 transition-all border ${
                  isTransparent
                    ? "bg-white text-black border-white hover:bg-transparent hover:text-white"
                    : "bg-black text-white border-black hover:bg-white hover:text-black"
                }`}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden hover:scale-110 transition-transform duration-300 p-2"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6 stroke-[2]" />
          </button>

          {/* Mobile Navigation Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent hideCloseButton side="left" className="w-full max-w-xs bg-white border-r border-zinc-200 p-0">
              <div className="flex flex-col h-full bg-white text-black font-spaceGrotesk">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                  <span className="font-black uppercase tracking-tighter text-2xl">Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 flex-1 space-y-6">
                  <MenuItems onItemClick={() => setMobileMenuOpen(false)} />
                </div>
                {user ? (
                  <div className="p-6 bg-zinc-50 border-t border-zinc-100 space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                      <Avatar className="h-12 w-12 border border-black p-0.5 bg-white">
                        <AvatarFallback className="bg-transparent text-black font-bold">
                          {user?.userName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">Authenticated as</span>
                        <span className="text-md font-semibold text-black uppercase tracking-tight">{user?.userName}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        navigate("/shop/account");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-10 bg-black text-white rounded-full font-bold uppercase tracking-widest text-[10px]"
                    >
                      Manage Account
                    </Button>
                    <Button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-10 bg-white text-black border border-black rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all duration-300"
                    >
                      Terminate Session
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                    <Button
                      onClick={() => {
                        navigate("/auth/login");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-10 bg-black text-white rounded-full font-bold uppercase tracking-widest text-[10px]"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

    </header>
  );
}
