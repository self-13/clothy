import { HousePlug, LogOut, Menu, ShoppingCart, UserCog } from "lucide-react";
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
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer"
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
        <Avatar className="bg-black cursor-pointer">
          <AvatarFallback className="bg-black text-white font-extrabold">
            {user?.userName?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="w-56">
        <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/shop/account")}>
          <UserCog className="mr-2 h-4 w-4" />
          Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-slate-300">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 gap-3">
        {/* Logo */}
        <Link to="/shop/home" className="flex items-center gap-2">
          <HousePlug className="h-6 w-6" />
          <span className="font-bold">Ecommerce</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden lg:block">
          <MenuItems />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Cart is ALWAYS visible */}
          <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
            <Button
              onClick={() => setOpenCartSheet(true)}
              variant="outline"
              size="icon"
              className="relative bg-slate-300"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-1 font-bold text-xs bg-white rounded-full px-1">
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
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle header menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs">
              <MenuItems />
              <div className="mt-6">
                {user ? (
                  <UserMenu user={user} handleLogout={handleLogout} navigate={navigate} />
                ) : (
                  <Button
                    onClick={() => navigate("/auth/login")}
                    variant="outline"
                    className="w-full bg-black text-white font-semibold hover:bg-gray-800"
                  >
                    Login
                  </Button>
                )}
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
                variant="outline"
                className="bg-black text-white font-semibold hover:bg-gray-800"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
