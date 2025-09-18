import { useEffect, useState } from "react";
import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Wallet, AlertCircle } from "lucide-react";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { orderId } = useSelector((state) => state.shopOrder);
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

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  // Calculate cash handling fee for COD
  const cashHandlingFee = paymentMethod === "cod" ? 60 : 0;
  const finalAmount = totalCartAmount + cashHandlingFee;

  const resetPaymentState = () => {
    setIsPaymentStart(false);
  };

  async function handleInitiatePayment() {
    if (!cartItems?.items || cartItems.items.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (!currentSelectedAddress) {
      toast({
        title: "Please select one address to proceed.",
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
      // ✅ Order data sent to backend
      const orderData = {
        userId: user?.id,
        cartId: cartItems?._id,
        cartItems: cartItems.items.map((singleCartItem) => ({
          productId: singleCartItem?.productId,
          title: singleCartItem?.title,
          image: singleCartItem?.image,
          price:
            singleCartItem?.salePrice > 0
              ? singleCartItem?.salePrice
              : singleCartItem?.price,
          quantity: singleCartItem?.quantity,
          selectedSize: singleCartItem?.selectedSize, // Include selected size
        })),
        addressInfo: {
          addressId: currentSelectedAddress?._id,
          address: currentSelectedAddress?.address,
          city: currentSelectedAddress?.city,
          pincode: currentSelectedAddress?.pincode,
          phone: currentSelectedAddress?.phone,
          notes: currentSelectedAddress?.notes,
        },
        paymentMethod: paymentMethod,
        totalAmount: totalCartAmount,
      };

      const res = await dispatch(createNewOrder(orderData));

      if (res?.payload?.success) {
        // For COD orders, redirect to success page directly
        if (paymentMethod === "cod") {
          sessionStorage.removeItem("currentOrderId");
          window.location.href = "/shop/payment-success";
          return;
        }

        // For online payments, proceed with Razorpay
        const { razorpayOrderId, amount, currency } = res.payload;

        // Verify we have the required Razorpay data
        if (!razorpayOrderId || !amount) {
          throw new Error("Missing Razorpay order information from server");
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
              // ✅ Send payment details + original order data to create DB entry
              const verifyRes = await dispatch(
                capturePayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderData: orderData, // Send the original order data
                })
              );

              if (verifyRes?.payload?.success) {
                sessionStorage.removeItem("currentOrderId");
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
                description: "You closed the payment window",
              });
            },
          },
        };

        // Double check that Razorpay is available
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
    <div className="flex flex-col bg-slate-100 min-h-screen">
      <div className="relative h-[200px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Address
            selectedId={currentSelectedAddress}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {cartItems && cartItems.items && cartItems.items.length > 0 ? (
                  cartItems.items.map((item) => (
                    <UserCartItemsContent
                      key={item.productId}
                      cartItem={item}
                    />
                  ))
                ) : (
                  <p className="text-gray-500">Your cart is empty</p>
                )}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-4">
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
                    <h3 className="font-medium">Online Payment</h3>
                    <p className="text-sm text-gray-500">
                      Pay securely with Razorpay
                    </p>
                  </div>
                </div>

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
                  <Wallet className="h-6 w-6 mr-3 text-blue-500" />
                  <div className="flex-1">
                    <h3 className="font-medium">Cash on Delivery (COD)</h3>
                    <p className="text-sm text-gray-500">
                      Pay when you receive your order
                    </p>
                  </div>
                  <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm font-medium">
                    + ₹60 fee
                  </div>
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
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{totalCartAmount.toFixed(2)}</span>
                </div>

                {paymentMethod === "cod" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Handling Fee</span>
                    <span className="text-amber-600">
                      ₹{cashHandlingFee.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-3 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">
                      ₹{finalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleInitiatePayment}
                className="w-full mt-6 py-3 text-lg"
                disabled={
                  isPaymentStart ||
                  (paymentMethod === "online" &&
                    !isRazorpayLoaded &&
                    !razorpayError)
                }
                size="lg"
              >
                {isPaymentStart ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : paymentMethod === "cod" ? (
                  "Place COD Order"
                ) : !isRazorpayLoaded && !razorpayError ? (
                  "Loading Payment..."
                ) : razorpayError ? (
                  "Try Again"
                ) : (
                  "Pay with Razorpay"
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
