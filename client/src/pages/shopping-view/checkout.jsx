import { useEffect, useState } from "react";
import Address from "@/components/shopping-view/address";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { 
  CreditCard, 
  Wallet, 
  AlertCircle, 
  Truck, 
  Shield, 
  Package, 
  MapPin, 
  ChevronRight,
  ChevronLeft,
  Check,
  Plus
} from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState(1); // 1: Order Items, 2: Address, 3: Payment
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
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
  const shippingFee = 0;
  const cashHandlingFee = paymentMethod === "cod" ? 60 : 0;
  const finalAmount = totalCartAmount + shippingFee + cashHandlingFee;

  const resetPaymentState = () => {
    setIsPaymentStart(false);
  };

  // Step navigation handlers
  const handleNextStep = () => {
    if (currentStep === 1 && cartItems?.items?.length > 0) {
      setCurrentStep(2);
    } else if (currentStep === 2 && currentSelectedAddress) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

    if (paymentMethod === "online" && !isRazorpayLoaded) {
      if (razorpayError) {
        toast({
          title: razorpayError,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment system is still loading. Please try again in a moment.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsPaymentStart(true);
    setRazorpayError(null);

    try {
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
        if (paymentMethod === "cod") {
          dispatch(clearCart(user?.id));
          toast({
            title: "Order placed successfully!",
            description: "Your COD order has been confirmed.",
          });
          window.location.href = "/shop/payment-success";
          return;
        }

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
                dispatch(clearCart(user?.id));
                window.location.href = "/shop/payment-success";
              } else {
                resetPaymentState();
                toast({
                  title: "Payment verification failed",
                  description: verifyRes?.payload?.message || "Please try again",
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
          theme: { color: "#000000" },
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
            description: response.error.description || "Please try another payment method",
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

  // Progress Steps
  const steps = [
    { number: 1, title: "Order Items", completed: currentStep > 1 },
    { number: 2, title: "Address", completed: currentStep > 2 },
    { number: 3, title: "Payment", completed: false }
  ];

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Header */}
      <div className="bg-black text-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-gray-300">Complete your purchase securely</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-6">
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.completed || currentStep === step.number
                      ? "bg-black border-black text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}>
                    {step.completed ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>
                  <span className={`ml-3 font-medium ${
                    step.completed || currentStep === step.number
                      ? "text-black"
                      : "text-gray-400"
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-12 h-0.5 bg-gray-300 mx-8"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        {/* Step 1: Order Items */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-black" />
                  <h2 className="text-xl font-bold text-black">Order Items</h2>
                </div>
                <Badge className="bg-gray-100 text-gray-800 border border-gray-300">
                  {cartItems?.items?.length || 0} items
                </Badge>
              </div>

              <div className="space-y-4">
                {cartItems && cartItems.items && cartItems.items.length > 0 ? (
                  cartItems.items.map((item) => (
                    <UserCartItemsContent
                      key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                      cartItem={item}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 border border-gray-200 rounded-lg">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg mb-2">Your cart is empty</p>
                    <Button 
                      onClick={() => window.location.href = "/shop/listing"}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                )}
              </div>

              {cartItems?.items?.length > 0 && (
                <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
                  <div className="text-lg font-semibold text-black">
                    Total: ₹{totalCartAmount.toFixed(2)}
                  </div>
                  <Button
                    onClick={handleNextStep}
                    className="bg-black text-white hover:bg-gray-800 px-8"
                    size="lg"
                  >
                    Continue to Address
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-black" />
                  <h2 className="text-xl font-bold text-black">Shipping Address</h2>
                </div>
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-gray-50"
                  onClick={() => {
                    // This would open address form - you can implement modal or separate page
                    toast({
                      title: "Add new address",
                      description: "Address form would open here",
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Address
                </Button>
              </div>

              <Address
                selectedId={currentSelectedAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />

              <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
                <Button
                  onClick={handlePreviousStep}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  size="lg"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Order
                </Button>
                
                <Button
                  onClick={handleNextStep}
                  className="bg-black text-white hover:bg-gray-800 px-8"
                  size="lg"
                  disabled={!currentSelectedAddress}
                >
                  Continue to Payment
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Method & Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-black" />
                  <h2 className="text-xl font-bold text-black">Payment Method</h2>
                </div>
                
                <div className="space-y-4">
                  {/* Online Payment */}
                  <div
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "online"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    onClick={() => setPaymentMethod("online")}
                  >
                    <div
                      className={`h-5 w-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                        paymentMethod === "online"
                          ? "border-black bg-black"
                          : "border-gray-400"
                      }`}
                    >
                      {paymentMethod === "online" && (
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <CreditCard className="h-5 w-5 mr-3 text-black" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black">Online Payment</h3>
                      <p className="text-gray-600 text-sm">Pay securely with Razorpay</p>
                    </div>
                  </div>

                  {/* COD Option */}
                  <div
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <div
                      className={`h-5 w-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                        paymentMethod === "cod"
                          ? "border-black bg-black"
                          : "border-gray-400"
                      }`}
                    >
                      {paymentMethod === "cod" && (
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <Wallet className="h-5 w-5 mr-3 text-black" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black">Cash on Delivery</h3>
                      <p className="text-gray-600 text-sm">Pay when you receive your order</p>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800 border border-gray-300">
                      + ₹60 fee
                    </Badge>
                  </div>
                </div>

                {paymentMethod === "online" && razorpayError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{razorpayError}</p>
                  </div>
                )}
              </div>

              {/* Selected Address Preview */}
              {currentSelectedAddress && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className="w-5 h-5 text-black" />
                    <h3 className="font-semibold text-black">Delivery Address</h3>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-medium text-black">{currentSelectedAddress.name}</p>
                    <p className="text-gray-600 text-sm mt-1">{currentSelectedAddress.address}</p>
                    <p className="text-gray-600 text-sm">
                      {currentSelectedAddress.city}, {currentSelectedAddress.state} - {currentSelectedAddress.pincode}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">Phone: {currentSelectedAddress.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-6 text-black border-b border-gray-200 pb-4">
                  Order Summary
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-black">
                      ₹{totalCartAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-black">
                      ₹{shippingFee.toFixed(2)}
                    </span>
                  </div>

                  {paymentMethod === "cod" && (
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Cash Handling Fee</span>
                      <span className="font-semibold text-black">
                        ₹{cashHandlingFee.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {cartSummary.totalDiscount > 0 && (
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-semibold text-green-600">
                        -₹{cartSummary.totalDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-black">Total Amount</span>
                      <span className="text-black">
                        ₹{finalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 text-center pt-2 border-t border-gray-200">
                    {cartSummary.totalItems} items in your order
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mt-6">
                  <Button
                    onClick={handleInitiatePayment}
                    className="w-full py-3 text-base font-semibold bg-black text-white hover:bg-gray-800 border border-black"
                    disabled={
                      isPaymentStart ||
                      isLoading ||
                      !cartItems?.items?.length ||
                      !currentSelectedAddress ||
                      (paymentMethod === "online" && !isRazorpayLoaded && !razorpayError)
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

                  <Button
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Address
                  </Button>

                  {paymentMethod === "cod" && (
                    <p className="text-sm text-gray-500 text-center">
                      You will pay ₹{finalAmount.toFixed(2)} when your order is delivered
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingCheckout;