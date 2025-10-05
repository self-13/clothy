import { useEffect, useState } from "react";
import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Wallet, AlertCircle, Truck, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { clearCart } from "@/store/shop/cart-slice";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { orderId, isLoading } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [razorpayError, setRazorpayError] = useState(null);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    // Load Razorpay script dynamically
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          setIsRazorpayLoaded(true);
          setRazorpayError(null);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          resolve(true);
          setIsRazorpayLoaded(true);
          setRazorpayError(null);
        };
        script.onerror = () => {
          resolve(false);
          setIsRazorpayLoaded(false);
          setRazorpayError(
            "Failed to load payment system. Please refresh the page."
          );
          console.error("Failed to load Razorpay script");
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  // Calculate cart totals
  const cartSummary = cartItems?.summary || {
    totalItems: 0,
    subtotal: 0,
    totalDiscount: 0,
    estimatedTotal: 0,
  };

  const totalCartAmount = cartSummary.subtotal || 0;

  // Calculate fees
  const shippingFee = 0;
  const cashHandlingFee = paymentMethod === "cod" ? 60 : 0;
  const finalAmount = totalCartAmount + shippingFee + cashHandlingFee;

  const resetPaymentState = () => {
    setIsPaymentStart(false);
  };

  async function handleInitiatePayment() {
    if (!cartItems?.items || cartItems.items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before proceeding",
        variant: "destructive",
      });
      return;
    }

    if (!currentSelectedAddress) {
      toast({
        title: "Shipping address required",
        description: "Please select a shipping address to proceed",
        variant: "destructive",
      });
      return;
    }

    // Check if Razorpay is loaded for online payments
    if (paymentMethod === "online" && !isRazorpayLoaded) {
      if (razorpayError) {
        toast({
          title: razorpayError,
          variant: "destructive",
        });
      } else {
        toast({
          title:
            "Payment system is still loading. Please try again in a moment.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsPaymentStart(true);
    setRazorpayError(null);

    try {
      // Prepare order data
      const orderData = {
        userId: user?.id,
        cartId: cartItems?._id,
        cartItems: cartItems.items.map((item) => ({
          productId: item?.productId,
          title: item?.title,
          image: item?.image || item?.images?.[0],
          price: item?.salePrice > 0 ? item?.salePrice : item?.price,
          salePrice: item?.salePrice,
          quantity: item?.quantity,
          selectedSize: item?.selectedSize,
          selectedColor: item?.selectedColor,
          brand: item?.brand,
        })),
        addressInfo: {
          name: currentSelectedAddress?.name,
          address: currentSelectedAddress?.address,
          city: currentSelectedAddress?.city,
          state: currentSelectedAddress?.state,
          pincode: currentSelectedAddress?.pincode,
          phone: currentSelectedAddress?.phone,
          notes: currentSelectedAddress?.notes,
          type: currentSelectedAddress?.type || "home",
        },
        paymentMethod: paymentMethod,
        totalAmount: totalCartAmount,
      };

      console.log("🔄 Creating order with data:", orderData);

      const res = await dispatch(createNewOrder(orderData));

      if (res?.payload?.success) {
        // For COD orders
        if (paymentMethod === "cod") {
          // Clear cart after successful COD order
          dispatch(clearCart(user?.id));
          toast({
            title: "Order placed successfully!",
            description: "Your COD order has been confirmed.",
          });
          window.location.href = "/shop/payment-success";
          return;
        }

        // For online payments
        const { razorpayOrderId, amount, currency } = res.payload;

        if (!razorpayOrderId || !amount) {
          throw new Error("Missing payment information from server");
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: amount,
          currency: currency || "INR",
          name: "My Shop",
          description: "Order Payment",
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              const verifyRes = await dispatch(
                capturePayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderData: orderData,
                })
              );

              if (verifyRes?.payload?.success) {
                // Clear cart after successful payment
                dispatch(clearCart(user?.id));
                window.location.href = "/shop/payment-success";
              } else {
                resetPaymentState();
                toast({
                  title: "Payment verification failed",
                  description:
                    verifyRes?.payload?.message || "Please try again",
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error("Payment handler error:", error);
              resetPaymentState();
              toast({
                title: "Payment processing error",
                variant: "destructive",
              });
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: currentSelectedAddress?.phone || "",
          },
          theme: { color: "#3399cc" },
          modal: {
            ondismiss: function () {
              resetPaymentState();
              toast({
                title: "Payment cancelled",
                description: "You can try again anytime",
              });
            },
          },
        };

        if (typeof window.Razorpay !== "function") {
          throw new Error("Razorpay is not available");
        }

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          resetPaymentState();
          toast({
            title: "Payment failed",
            description:
              response.error.description || "Please try another payment method",
            variant: "destructive",
          });
        });

        rzp.open();
      } else {
        resetPaymentState();
        toast({
          title: "Failed to create order",
          description: res?.payload?.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Order creation error:", error);
      resetPaymentState();
      toast({
        title: "Error creating order",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-col bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">Checkout</h1>
            <p className="text-lg">Complete your purchase</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Address & Cart Items */}
          <div className="space-y-6">
            {/* Address Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Truck className="w-6 h-6 text-blue-600" />
                Shipping Address
              </h2>
              <Address
                selectedId={currentSelectedAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            </div>

            {/* Order Items Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {cartItems && cartItems.items && cartItems.items.length > 0 ? (
                  cartItems.items.map((item) => (
                    <UserCartItemsContent
                      key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                      cartItem={item}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Your cart is empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Payment & Summary */}
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                Payment Method
              </h2>
              <div className="space-y-4">
                {/* Online Payment Option */}
                <div
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === "online"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("online")}
                >
                  <div
                    className={`h-5 w-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      paymentMethod === "online"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "online" && (
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <CreditCard className="h-6 w-6 mr-3 text-blue-500" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Online Payment</h3>
                    <p className="text-gray-600">Pay securely with Razorpay</p>
                  </div>
                </div>

                {/* COD Option */}
                <div
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div
                    className={`h-5 w-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      paymentMethod === "cod"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "cod" && (
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <Wallet className="h-6 w-6 mr-3 text-orange-500" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Cash on Delivery</h3>
                    <p className="text-gray-600">
                      Pay when you receive your order
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800"
                  >
                    + ₹60 fee
                  </Badge>
                </div>
              </div>

              {paymentMethod === "online" && razorpayError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{razorpayError}</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    ₹{totalCartAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    ₹{shippingFee.toFixed(2)}
                  </span>
                </div>

                {paymentMethod === "cod" && (
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Cash Handling Fee</span>
                    <span className="font-semibold text-orange-600">
                      ₹{cashHandlingFee.toFixed(2)}
                    </span>
                  </div>
                )}

                {cartSummary.totalDiscount > 0 && (
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Save</span>
                    <span className="font-semibold text-green-600">
                      -₹{cartSummary.totalDiscount.toFixed(2)}
                    </span>
                  </div>
                )}


                <div className="flex justify-between text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">
                    ₹{finalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mt-2">
                  {cartSummary.totalItems} items
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handleInitiatePayment}
                className="w-full mt-6 py-3 text-lg font-semibold"
                disabled={
                  isPaymentStart ||
                  isLoading ||
                  !cartItems?.items?.length ||
                  !currentSelectedAddress ||
                  (paymentMethod === "online" &&
                    !isRazorpayLoaded &&
                    !razorpayError)
                }
                size="lg"
              >
                {isPaymentStart || isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : paymentMethod === "cod" ? (
                  `Place COD Order - ₹${finalAmount.toFixed(2)}`
                ) : !isRazorpayLoaded && !razorpayError ? (
                  "Loading Payment..."
                ) : razorpayError ? (
                  "Try Again"
                ) : (
                  `Pay Now - ₹${finalAmount.toFixed(2)}`
                )}
              </Button>

              {paymentMethod === "cod" && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  You will pay ₹{finalAmount.toFixed(2)} when your order is
                  delivered
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
