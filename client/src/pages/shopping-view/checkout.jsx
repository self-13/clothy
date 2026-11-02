import { useEffect, useState } from "react";
import Address from "@/components/shopping-view/address";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import {
  CreditCard,
  Wallet,
  AlertCircle,
  Truck,
  ShieldCheck,
  Package,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Check,
  Ticket,
  ArrowUpRight,
} from "lucide-react";
import { clearCart } from "@/store/shop/cart-slice";
import { validateCoupon, clearCoupon } from "@/store/shop/coupon-slice";
import { Input } from "@/components/ui/input";
import Footer from "@/components/shopping-view/footer";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [razorpayError, setRazorpayError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Order Items, 2: Address, 3: Payment
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const { appliedCoupon, isLoading: isCouponLoading } = useSelector((state) => state.shopCoupons);

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
            "Payment gateway temporarily inaccessible. Please refresh or choose Cash on Delivery."
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

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "fixed") {
      couponDiscount = appliedCoupon.discountAmount;
    } else {
      couponDiscount = (totalCartAmount * appliedCoupon.discountAmount) / 100;
    }
  }

  const rawFinalAmount = Math.max(0, totalCartAmount + shippingFee + cashHandlingFee - couponDiscount);
  const finalAmount = paymentMethod === "cod" ? Math.ceil(rawFinalAmount) : rawFinalAmount;

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    dispatch(validateCoupon({ code: couponCode, orderAmount: totalCartAmount })).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Privilege code applied" });
      } else {
        toast({ title: data?.payload?.message || "Invalid promotional code", variant: "destructive" });
      }
    });
  };

  const handleRemoveCoupon = () => {
    dispatch(clearCoupon());
    setCouponCode("");
  };

  const resetPaymentState = () => {
    setIsPaymentStart(false);
  };

  // Step navigation handlers
  const handleNextStep = () => {
    if (currentStep === 1 && cartItems?.items?.length > 0) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 2 && currentSelectedAddress) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  async function handleInitiatePayment() {
    if (!cartItems?.items || cartItems.items.length === 0) {
      toast({
        title: "Your shopping bag is empty",
        description: "Please select garments before proceeding to checkout",
        variant: "destructive",
      });
      return;
    }

    if (!currentSelectedAddress) {
      toast({
        title: "Delivery address required",
        description: "Please choose or add a delivery address",
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
          title: "Payment system initializing. Please try again shortly.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsPaymentStart(true);
    setRazorpayError(null);

    try {
      const orderData = {
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
        totalAmount: finalAmount,
        couponId: appliedCoupon?._id,
        couponCode: appliedCoupon?.code,
        discountAmount: couponDiscount,
      };

      const res = await dispatch(createNewOrder(orderData));

      if (res?.payload?.success) {
        if (paymentMethod === "cod") {
          dispatch(clearCart());
          toast({
            title: "Order placed successfully",
            description: "Your Cash on Delivery order is confirmed.",
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
          name: "LUXERIDGE",
          description: "Atelier Acquisition Settlement",
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
                dispatch(clearCart());
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
            name: user?.name || user?.userName || "",
            email: user?.email || "",
            contact: currentSelectedAddress?.phone || "",
          },
          theme: { color: "#121212" },
          modal: {
            ondismiss: function () {
              resetPaymentState();
              toast({
                title: "Settlement cancelled",
                description: "You may resume your purchase at any time.",
              });
            },
          },
        };

        if (typeof window.Razorpay !== "function") {
          throw new Error("Razorpay gateway is not ready");
        }

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          resetPaymentState();
          toast({
            title: "Settlement failed",
            description: response.error?.description || "Please try an alternative payment method",
            variant: "destructive",
          });
        });

        rzp.open();
      } else {
        resetPaymentState();
        toast({
          title: "Failed to initiate order",
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

  // Progress Steps Definition
  const steps = [
    { number: 1, label: "Bag Review", completed: currentStep > 1 },
    { number: 2, label: "Delivery Destination", completed: currentStep > 2 },
    { number: 3, label: "Settlement", completed: false },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#121212] font-sans pt-20">
      {/* Header Banner */}
      <div className="bg-[#FAF9F6] border-b border-zinc-200/80 py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block mb-1.5">
            Concierge Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#121212] font-normal">
            Complete Acquisition
          </h1>
        </div>
      </div>

      {/* Progress Steps Navigator */}
      <div className="border-b border-zinc-200/80 bg-white sticky top-20 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="flex justify-between sm:justify-center items-center py-4 sm:gap-12">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number;
              const isPast = step.completed;

              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                        isPast
                          ? "bg-[#121212] text-white"
                          : isActive
                          ? "border-2 border-[#121212] bg-white text-[#121212]"
                          : "border border-zinc-300 text-zinc-400 bg-white"
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.number}
                    </div>
                    <span
                      className={`text-xs uppercase tracking-[0.14em] font-medium transition-colors ${
                        isActive
                          ? "text-[#121212] font-semibold"
                          : isPast
                          ? "text-zinc-600"
                          : "text-zinc-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden sm:block w-16 h-[1px] bg-zinc-200 mx-6" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Contents */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-5xl flex-1">
        {/* Step 1: Order Items */}
        {currentStep === 1 && (
          <div className="bg-white border border-zinc-200/80 rounded-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-zinc-500 stroke-[1.8]" />
                <h2 className="font-serif text-xl text-[#121212]">Curated Selections</h2>
              </div>
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                {cartItems?.items?.length || 0} Piece{cartItems?.items?.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="divide-y divide-zinc-100">
              {cartItems && cartItems.items && cartItems.items.length > 0 ? (
                cartItems.items.map((item) => (
                  <UserCartItemsContent
                    key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                    cartItem={item}
                  />
                ))
              ) : (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 mx-auto mb-3 text-zinc-300 stroke-[1.3]" />
                  <p className="font-serif text-lg text-zinc-700 mb-1">Your bag is empty</p>
                  <p className="text-xs text-zinc-500 mb-6">Explore the catalogue to select exceptional pieces.</p>
                  <a
                    href="/shop/listing"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#121212] text-white hover:bg-black text-xs font-semibold uppercase tracking-[0.14em] rounded-sm transition-all"
                  >
                    <span>Explore Collection</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {cartItems?.items?.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-200/80">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 block">
                    Subtotal Estimate
                  </span>
                  <span className="font-serif text-2xl font-semibold text-[#121212]">
                    ₹{totalCartAmount.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-[#121212] hover:bg-black text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] rounded-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>Select Delivery Address</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Address */}
        {currentStep === 2 && (
          <div className="bg-white border border-zinc-200/80 rounded-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-zinc-500 stroke-[1.8]" />
                <div>
                  <h2 className="font-serif text-xl text-[#121212]">Delivery Destination</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Choose an address or add a new residential delivery location.</p>
                </div>
              </div>
            </div>

            <Address
              selectedId={currentSelectedAddress}
              setCurrentSelectedAddress={setCurrentSelectedAddress}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-zinc-200/80">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold uppercase tracking-[0.14em] rounded-sm transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Return to Bag</span>
              </button>

              <button
                onClick={handleNextStep}
                disabled={!currentSelectedAddress}
                className="px-8 py-3.5 bg-[#121212] hover:bg-black disabled:bg-zinc-300 text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] rounded-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Proceed to Settlement</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Payment Options & Delivery Recap */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method Card */}
              <div className="bg-white border border-zinc-200/80 rounded-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                  <ShieldCheck className="w-5 h-5 text-zinc-600 stroke-[1.8]" />
                  <div>
                    <h2 className="font-serif text-xl text-[#121212]">Payment Settlement</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Encrypted transactions handled through authenticated gateways.</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* Online Payment */}
                  <div
                    onClick={() => setPaymentMethod("online")}
                    className={`p-5 rounded-sm border cursor-pointer transition-all ${
                      paymentMethod === "online"
                        ? "border-[#121212] bg-[#FAF9F6]"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          paymentMethod === "online"
                            ? "border-[#121212] bg-[#121212]"
                            : "border-zinc-300 bg-white"
                        }`}
                      >
                        {paymentMethod === "online" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-base text-[#121212]">
                            Online Payment
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200/60">
                            Instant & Verified
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          UPI, Debit / Credit Cards, NetBanking via Razorpay secure checkout.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-5 rounded-sm border cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-[#121212] bg-[#FAF9F6]"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          paymentMethod === "cod"
                            ? "border-[#121212] bg-[#121212]"
                            : "border-zinc-300 bg-white"
                        }`}
                      >
                        {paymentMethod === "cod" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-base text-[#121212]">
                            Cash on Delivery
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-xs">
                            + ₹60 Fee
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Pay cash upon physical delivery. Includes ₹60 logistics handling fee.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentMethod === "online" && razorpayError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-700">{razorpayError}</p>
                  </div>
                )}
              </div>

              {/* Delivery Address Review */}
              {currentSelectedAddress && (
                <div className="bg-white border border-zinc-200/80 rounded-sm p-6 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-zinc-500 stroke-[1.8]" />
                      <h3 className="font-serif text-base text-[#121212]">Destination Recap</h3>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-black underline underline-offset-4"
                    >
                      Change
                    </button>
                  </div>

                  <div className="text-xs text-zinc-600 space-y-1">
                    <p className="font-semibold text-[#121212]">{currentSelectedAddress.name}</p>
                    <p>{currentSelectedAddress.address}</p>
                    <p>
                      {currentSelectedAddress.city}, {currentSelectedAddress.state} {currentSelectedAddress.pincode}
                    </p>
                    <p className="text-zinc-500 pt-1">Phone: {currentSelectedAddress.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Order Summary & Settlement Trigger */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-zinc-200/80 rounded-sm p-6 space-y-5 sticky top-36 shadow-xs">
                <div className="pb-3 border-b border-zinc-100">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                    Atelier Summary
                  </span>
                  <h3 className="font-serif text-xl text-[#121212]">
                    Acquisition Total
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Items Subtotal</span>
                    <span className="font-medium text-[#121212]">₹{totalCartAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-600">
                    <span>Complimentary Shipping</span>
                    <span className="font-medium text-emerald-700">₹0.00</span>
                  </div>

                  {paymentMethod === "cod" && (
                    <div className="flex justify-between text-zinc-600">
                      <span>Cash Handling Fee</span>
                      <span className="font-medium text-[#121212]">₹{cashHandlingFee.toFixed(2)}</span>
                    </div>
                  )}

                  {cartSummary.totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Garment Discount</span>
                      <span className="font-semibold">-₹{cartSummary.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 block">
                          Code: {appliedCoupon.code}
                        </span>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-[11px] text-emerald-600 hover:text-emerald-800 underline underline-offset-2"
                        >
                          Remove code
                        </button>
                      </div>
                      <span className="font-semibold text-emerald-800">
                        -₹{couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Promo Input */}
                  <div className="pt-3 border-t border-zinc-100 space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 block">
                      Promotional Privilege
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                        <Input
                          placeholder="ENTER CODE"
                          className="pl-9 h-10 rounded-sm border border-zinc-300 focus:border-black font-mono text-xs uppercase tracking-wider"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          disabled={!!appliedCoupon || isCouponLoading}
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode || !!appliedCoupon || isCouponLoading}
                        className="px-4 h-10 bg-[#121212] hover:bg-black disabled:bg-zinc-300 text-white text-xs font-semibold uppercase tracking-[0.14em] rounded-sm transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Final Payable */}
                  <div className="pt-4 border-t border-zinc-200/90 flex justify-between items-baseline">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#121212]">
                      Total Payable
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#121212]">
                      ₹{finalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleInitiatePayment}
                    disabled={
                      isPaymentStart ||
                      isLoading ||
                      !cartItems?.items?.length ||
                      !currentSelectedAddress ||
                      (paymentMethod === "online" && !isRazorpayLoaded && !razorpayError)
                    }
                    className="w-full py-4 bg-[#121212] hover:bg-black disabled:bg-zinc-300 text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] rounded-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm"
                  >
                    {isPaymentStart || isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Authorizing Settlement...</span>
                      </div>
                    ) : paymentMethod === "cod" ? (
                      `Confirm Order (COD) — ₹${finalAmount.toFixed(2)}`
                    ) : !isRazorpayLoaded && !razorpayError ? (
                      "Initializing Gateway..."
                    ) : razorpayError ? (
                      "Retry Settlement"
                    ) : (
                      `Pay With Razorpay — ₹${finalAmount.toFixed(2)}`
                    )}
                  </button>

                  <button
                    onClick={handlePreviousStep}
                    className="w-full py-2.5 border border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300 text-xs font-semibold uppercase tracking-[0.14em] rounded-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to Address</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default ShoppingCheckout;