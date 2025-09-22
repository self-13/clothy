import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { checkAuth, restoreSession, logoutUser } from "./store/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import SearchProducts from "./pages/shopping-view/search";
import AuthVerifyOTP from "./pages/auth/verify-otp";
import AuthForgotPassword from "./pages/auth/forgot-password";
import AuthResetPassword from "./pages/auth/reset-password";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Improved DevTools Detection Hook
function useDetectDevTools() {
  const dispatch = useDispatch();
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);

  useEffect(() => {
    // Clear local storage function
    const clearUserData = () => {
      try {
        // Clear all authentication-related data from localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("session");
        localStorage.removeItem("reduxState");

        // Clear all items that might contain user data
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith("auth") ||
            key.startsWith("user") ||
            key.startsWith("session")
          ) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    };

    // Method 1: Check window dimensions vs screen dimensions
    const checkWindowSize = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      return widthThreshold || heightThreshold;
    };

    // Method 2: Check debugger statement execution time
    const checkDebugger = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      return end - start > 100;
    };

    // Method 3: Monitor console events
    const checkConsole = () => {
      if (!window.console || !console.log) return false;

      const element = document.createElement("div");
      Object.defineProperty(element, "id", {
        get: function () {
          setDevtoolsOpen(true);
          clearUserData();
          dispatch(logoutUser());
          return "";
        },
      });

      console.log("%c", element);
      return false;
    };

    // Combined check function
    const checkDevTools = () => {
      if (checkWindowSize()) {
        setDevtoolsOpen(true);
        clearUserData();
        dispatch(logoutUser());
        return;
      }

      try {
        if (checkDebugger()) {
          setDevtoolsOpen(true);
          clearUserData();
          dispatch(logoutUser());
          return;
        }
      } catch (e) {
        // Debugger statement might be caught in some environments
      }

      checkConsole();
    };

    // Check immediately and set up interval
    checkDevTools();
    const interval = setInterval(checkDevTools, 300);

    // Set up resize listener (DevTools often changes window size)
    window.addEventListener("resize", checkDevTools);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", checkDevTools);
    };
  }, [dispatch]);

  return devtoolsOpen;
}

// ---- Main App ----
function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const devtoolsDetected = useDetectDevTools();

  useEffect(() => {
    dispatch(restoreSession());
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return <Skeleton className="w-[800] bg-black h-[600px]" />;

  return (
    <div className="flex flex-col overflow-hidden bg-slate-300">
      {devtoolsDetected && (
        <div className="fixed inset-0 bg-red-600 text-white z-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Developer Tools Detected
            </h2>
            <p>This application does not allow the use of developer tools.</p>
            <p>You have been logged out for security reasons.</p>
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={<CheckAuth isAuthenticated={isAuthenticated} user={user} />}
        />
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="verify-otp" element={<AuthVerifyOTP />} />
          <Route path="forgot-password" element={<AuthForgotPassword />} />
          <Route path="reset-password" element={<AuthResetPassword />} />
        </Route>
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
        </Route>
        <Route
          path="/shop"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="search" element={<SearchProducts />} />
        </Route>
        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
