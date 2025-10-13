import { HousePlug, LogOut, Menu, ShoppingCart, UserCog, Search, X } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
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
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
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

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems
        .filter(menuItem => menuItem.id !== 'search')
        .map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
          key={menuItem.id}
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}

function UserMenu({ user, handleLogout, navigate }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="bg-gray-600 cursor-pointer border-2 border-gray-400 shadow-md">
          <AvatarFallback className="bg-transparent text-white font-bold">
            {user?.userName?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="w-56 bg-white border-2 border-gray-300 shadow-lg">
        <DropdownMenuLabel className="text-gray-800 font-bold">Welcome, {user?.userName}! 👋</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-300" />
        <DropdownMenuItem 
          onClick={() => navigate("/shop/account")}
          className="text-gray-700 hover:bg-gray-100 cursor-pointer font-medium"
        >
          <UserCog className="mr-2 h-4 w-4 text-gray-600" />
          Account
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-300" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-gray-700 hover:bg-gray-100 cursor-pointer font-medium"
        >
          <LogOut className="mr-2 h-4 w-4 text-gray-600" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ShoppingHeader() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop/listing?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-gray-300 bg-gradient-to-r from-gray-50 via-white to-gray-50 text-gray-800 shadow-lg">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 gap-3">
        {/* Logo */}
        <Link to="/shop/home" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <img src="/logo.png" alt="logo" className="size-24" />
        </Link>

        {/* Desktop menu */}
        <div className="hidden lg:block">
          <MenuItems />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search Icon */}
          <Button
            onClick={() => setSearchOpen(true)}
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:bg-gray-200 rounded-full border border-gray-300 shadow-md"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Cart with Black & White Style */}
          <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
            <Button
              onClick={() => setOpenCartSheet(true)}
              variant="ghost"
              size="icon"
              className="relative text-gray-600 hover:bg-gray-200 rounded-full border border-gray-300 shadow-md"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 font-bold text-xs bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {cartItems?.items?.length || 0}
              </span>
              <span className="sr-only">User cart</span>
            </Button>
            <UserCartWrapper
              setOpenCartSheet={setOpenCartSheet}
              cartItems={cartItems?.items?.length > 0 ? cartItems.items : []}
            />
          </Sheet>

          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-gray-600 hover:bg-gray-200 rounded-full border border-gray-300 shadow-md">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle header menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs bg-white text-gray-800 border-r-2 border-gray-300">
              <div className="flex flex-col h-full">
                {/* Mobile Search */}
                <div className="p-4 border-b border-gray-200">
                  <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-white border-2 border-gray-300 text-gray-800 placeholder-gray-400"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="bg-gray-700 text-white hover:scale-110 transition-transform"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                </div>

                <div className="flex-1">
                  <MenuItems />
                </div>
                
                <div className="mt-6 p-4 border-t border-gray-200">
                  {user ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                      <UserMenu user={user} handleLogout={handleLogout} navigate={navigate} />
                      <div className="text-sm font-bold text-gray-700">Hello{user?.userName}! 🎉</div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => navigate("/auth/login")}
                      className="w-full bg-gray-800 text-white font-bold hover:scale-105 transition-transform shadow-md"
                    >
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop user menu */}
          <div className="hidden lg:block">
            {user ? (
              <UserMenu user={user} handleLogout={handleLogout} navigate={navigate} />
            ) : (
              <Button
                onClick={() => navigate("/auth/login")}
                className="bg-gray-800 text-white font-bold hover:scale-105 transition-transform shadow-md"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-start justify-center pt-20">
          <div className="w-full max-w-2xl px-6">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="🔍 Search for awesome products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 bg-white border-2 border-gray-300 text-gray-800 placeholder-gray-400 pl-6 pr-16 text-lg rounded-full shadow-lg"
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-2 h-10 w-10 bg-gray-700 hover:scale-110 transition-transform rounded-full shadow-md"
              >
                <Search className="h-5 w-5 text-white" />
              </Button>
            </form>
            <Button
              variant="ghost"
              onClick={() => setSearchOpen(false)}
              className="absolute top-6 right-6 text-gray-600 hover:bg-gray-200 rounded-full h-10 w-10 border border-gray-300"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default ShoppingHeader;