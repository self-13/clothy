import {
  HousePlug,
  LogOut,
  Menu,
  ShoppingCart,
  UserCog,
  Search,
  X,
  User
} from "lucide-react";
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

function MenuItems({ onItemClick }) {
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

    if (onItemClick) {
      onItemClick();
    }
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-10 lg:flex-row">
      {shoppingViewHeaderMenuItems
        .filter((menuItem) => menuItem.id !== "search")
        .map((menuItem) => (
          <Label
            onClick={() => handleNavigate(menuItem)}
            className="text-[10px] font-black uppercase tracking-[0.25em] cursor-pointer text-zinc-400 hover:text-black transition-all duration-300 relative group"
            key={menuItem.id}
          >
            {menuItem.label}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full" />
          </Label>
        ))}
    </nav>
  );
}

function UserMenu({ user, handleLogout, navigate }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer group">
           <div className="hidden md:block text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">Account</p>
              <p className="text-sm font-bold text-black uppercase tracking-tight">{user?.userName}</p>
           </div>
           <Avatar className="h-10 w-10 rounded-none border-2 border-black p-0.5 bg-white group-hover:bg-black group-hover:text-white transition-all duration-300">
             <AvatarFallback className="bg-transparent text-inherit font-black text-xs">
               {user?.userName?.[0]?.toUpperCase()}
             </AvatarFallback>
           </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-2"
      >
        <DropdownMenuLabel className="text-black font-black uppercase tracking-tighter text-lg px-2 py-3 border-b border-zinc-100">
          PRO_FILE
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigate("/shop/account")}
          className="rounded-none focus:bg-zinc-100 cursor-pointer font-bold uppercase text-[10px] tracking-widest py-3 px-2 flex items-center gap-2"
        >
          <UserCog className="h-4 w-4" /> Management
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-none focus:bg-red-50 focus:text-red-600 cursor-pointer font-bold uppercase text-[10px] tracking-widest py-3 px-2 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Terminate Session
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  function handleSearch(e) {
    if (e) e.preventDefault();
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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link
          to="/shop/home"
          className="flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <img src="/logo.png" alt="logo" className="size-24" />
        </Link>

        {/* Desktop Menu - Centered */}
        <div className="hidden lg:block flex-1 max-w-2xl px-12">
          <MenuItems />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Search Button */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-black hover:scale-110 transition-transform duration-300"
          >
             <Search className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Cart */}
          <Sheet
            open={openCartSheet}
            onOpenChange={() => setOpenCartSheet(false)}
          >
            <button
              onClick={() => setOpenCartSheet(true)}
              className="relative text-black hover:scale-110 transition-transform duration-300"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
              {cartItems?.items?.length > 0 && (
                <span className="absolute -top-2 -right-2 font-black text-[8px] bg-black text-white rounded-none w-4 h-4 flex items-center justify-center">
                   {cartItems.items.length}
                </span>
              )}
            </button>
            <UserCartWrapper
              setOpenCartSheet={setOpenCartSheet}
              cartItems={cartItems?.items?.length > 0 ? cartItems.items : []}
            />
          </Sheet>

          {/* User / Login */}
          <div className="hidden md:block">
            {user ? (
              <UserMenu
                user={user}
                handleLogout={handleLogout}
                navigate={navigate}
              />
            ) : (
              <Button
                onClick={() => navigate("/auth/login")}
                className="bg-black text-white rounded-none font-black uppercase tracking-widest text-[10px] h-10 px-8 hover:bg-zinc-800 transition-all"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden text-black">
                <Menu className="h-6 w-6 stroke-[2.5]" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full max-w-xs bg-white border-r-2 border-black p-0"
            >
               <div className="flex flex-col h-full bg-white">
                  <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-black text-white">
                     <span className="font-black uppercase tracking-tighter text-2xl">Navigation</span>
                     <X onClick={() => setMobileMenuOpen(false)} className="w-6 h-6 cursor-pointer" />
                  </div>
                  <div className="p-8 space-y-8 flex-1">
                     <MenuItems onItemClick={() => setMobileMenuOpen(false)} />
                  </div>
                  {user && (
                    <div className="p-8 bg-zinc-50 space-y-4">
                       <div className="flex items-center gap-4 mb-4">
                          <Avatar className="h-12 w-12 rounded-none border-2 border-black p-0.5 bg-white">
                            <AvatarFallback className="bg-transparent text-black font-black">
                              {user?.userName?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Authenticated as</span>
                             <span className="text-lg font-bold text-black uppercase tracking-tight">{user?.userName}</span>
                          </div>
                       </div>
                       <Button 
                          onClick={() => { navigate("/shop/account"); setMobileMenuOpen(false); }}
                          className="w-full h-12 bg-black text-white rounded-none font-black uppercase tracking-widest text-[10px]"
                       >
                          Manage Account
                       </Button>
                    </div>
                  )}
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Modern Search Overlay */}
      <div className={`absolute left-0 right-0 bg-white border-b border-black overflow-hidden transition-all duration-500 ease-in-out ${searchOpen ? "h-24 opacity-100" : "h-0 opacity-0"}`}>
         <div className="container mx-auto px-8 h-full flex items-center">
            <Search className="w-6 h-6 text-zinc-300 mr-4" />
            <form onSubmit={handleSearch} className="flex-1 flex gap-4">
               <input 
                  className="flex-1 bg-transparent border-none outline-none text-2xl font-black uppercase tracking-tighter placeholder:text-zinc-100"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus={searchOpen}
               />
               <button type="submit" className="text-xs font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:text-zinc-500 transition-colors">Confirm</button>
            </form>
            <X onClick={() => setSearchOpen(false)} className="w-6 h-6 ml-8 cursor-pointer text-zinc-300 hover:text-black transition-colors" />
         </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;

