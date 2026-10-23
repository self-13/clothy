import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { X, RotateCcw, Clock, CheckCircle, XCircle, Package, MapPin, CreditCard } from "lucide-react";

function ShoppingOrderDetailsView({
  orderDetails,
  onCancellationRequest,
  onReturnRequest,
  canCancelOrder,
  canReturnOrder,
}) {
  const { user } = useSelector((state) => state.auth);

  if (!orderDetails) {
    return (
      <DialogContent className="sm:max-w-[650px] bg-[#FAF9F6] border border-zinc-200">
        <div className="text-center py-12">
          <p className="text-xs uppercase tracking-widest text-zinc-400">Order record not available</p>
        </div>
      </DialogContent>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          dot: "bg-emerald-600",
        };
      case "processing":
      case "shipped":
      case "out_for_delivery":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200/80",
          dot: "bg-amber-600",
        };
      case "cancelled":
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200/80",
          dot: "bg-rose-600",
        };
      case "returned":
      default:
        return {
          bg: "bg-zinc-100 text-zinc-700 border-zinc-200",
          dot: "bg-zinc-500",
        };
    }
  };

  const getCancellationStatus = (order) => {
    if (!order?.cancellation?.requested) return null;

    const status = order.cancellation.status;
    const requestedAt = new Date(
      order.cancellation.requestedAt
    ).toLocaleDateString();

    switch (status) {
      case "pending":
        return {
          text: `Cancellation Pending (${requestedAt})`,
          style: "bg-amber-50 text-amber-800 border-amber-200/80",
          icon: <Clock className="w-3 h-3 mr-1" />,
        };
      case "approved":
        return {
          text: `Cancellation Approved (${requestedAt})`,
          style: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
        };
      case "rejected":
        return {
          text: `Cancellation Declined (${requestedAt})`,
          style: "bg-rose-50 text-rose-800 border-rose-200/80",
          icon: <XCircle className="w-3 h-3 mr-1" />,
        };
      default:
        return null;
    }
  };

  const getReturnStatus = (order) => {
    if (!order?.return?.requested) return null;

    const status = order.return.status;
    const requestedAt = new Date(order.return.requestedAt).toLocaleDateString();

    switch (status) {
      case "pending":
        return {
          text: `Return Pending (${requestedAt})`,
          style: "bg-amber-50 text-amber-800 border-amber-200/80",
          icon: <Clock className="w-3 h-3 mr-1" />,
        };
      case "approved":
        return {
          text: `Return Approved (${requestedAt})`,
          style: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
        };
      case "rejected":
        return {
          text: `Return Declined (${requestedAt})`,
          style: "bg-rose-50 text-rose-800 border-rose-200/80",
          icon: <XCircle className="w-3 h-3 mr-1" />,
        };
      default:
        return null;
    }
  };

  const cancellationStatus = getCancellationStatus(orderDetails);
  const returnStatus = getReturnStatus(orderDetails);
  const showCancelButton = canCancelOrder(orderDetails) && !cancellationStatus;
  const showReturnButton = canReturnOrder(orderDetails) && !returnStatus;
  const statusConfig = getStatusBadge(orderDetails.orderStatus);

  const itemsTotal =
    orderDetails.items?.reduce((total, item) => {
      return total + (item.salePrice || item.price) * item.quantity;
    }, 0) || 0;

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[88vh] overflow-y-auto bg-[#FAF9F6] border border-zinc-200/80 p-6 sm:p-8 font-sans">
      <div className="space-y-6">
        {/* Header with Order ID & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-200/80">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block mb-1">
              Order Dossier
            </span>
            <h2 className="font-serif text-2xl text-[#121212]">
              #{orderDetails._id.slice(-8).toUpperCase()}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-sm border ${statusConfig.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {orderDetails.orderStatus?.replace(/_/g, " ")}
            </span>

            {cancellationStatus && (
              <span
                className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-sm border ${cancellationStatus.style}`}
              >
                {cancellationStatus.icon}
                {cancellationStatus.text}
              </span>
            )}

            {returnStatus && (
              <span
                className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-sm border ${returnStatus.style}`}
              >
                {returnStatus.icon}
                {returnStatus.text}
              </span>
            )}
          </div>
        </div>

        {/* Quick Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white rounded-sm border border-zinc-200/70 text-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">Placed On</span>
            <span className="text-[#121212] font-medium mt-1 block">
              {new Date(orderDetails.orderDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">Settlement</span>
            <span className="text-[#121212] font-medium mt-1 block uppercase tracking-wide">
              {orderDetails.paymentMethod}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">Payment State</span>
            <span className="text-emerald-700 font-semibold mt-1 block capitalize">
              {orderDetails.paymentStatus}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">Updated</span>
            <span className="text-[#121212] font-medium mt-1 block">
              {new Date(orderDetails.orderUpdateDate || orderDetails.orderDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons if eligible */}
        {(showCancelButton || showReturnButton) && (
          <div className="flex gap-3">
            {showCancelButton && (
              <button
                onClick={() => onCancellationRequest(orderDetails)}
                className="flex-1 py-2 px-4 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Request Cancellation</span>
              </button>
            )}
            {showReturnButton && (
              <button
                onClick={() => onReturnRequest(orderDetails)}
                className="flex-1 py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Request Return</span>
              </button>
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-zinc-400 stroke-[1.8]" />
            <h3 className="font-serif text-base text-[#121212]">Curated Items</h3>
          </div>

          <div className="space-y-2.5">
            {orderDetails.items?.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3.5 bg-white border border-zinc-200/70 rounded-sm"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-20 object-contain bg-[#FAF9F6] rounded-xs border border-zinc-200/60 p-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 block">
                    {item.brand}
                  </span>
                  <h4 className="font-serif text-sm text-[#121212] truncate mt-0.5">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 mt-1.5">
                    {item.selectedSize && (
                      <span className="bg-zinc-100 px-2 py-0.5 rounded-xs font-medium">
                        Size: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="bg-zinc-100 px-2 py-0.5 rounded-xs capitalize font-medium">
                        Color: {item.selectedColor}
                      </span>
                    )}
                    <span className="text-zinc-500 font-medium">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-serif text-sm font-semibold text-[#121212]">
                    ₹{(item.salePrice || item.price) * item.quantity}
                  </p>
                  {item.salePrice && item.salePrice < item.price && (
                    <p className="text-[11px] text-zinc-400 line-through">
                      ₹{item.price * item.quantity}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown & Shipping Address Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Shipping Address */}
          <div className="p-4 bg-white border border-zinc-200/70 rounded-sm space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 stroke-[1.8]" />
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">
                Delivery Destination
              </h4>
            </div>
            <p className="font-medium text-xs text-[#121212]">
              {user?.userName || user?.name || "Client"}
            </p>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {orderDetails.addressInfo?.address}
            </p>
            <p className="text-xs text-zinc-600">
              {orderDetails.addressInfo?.city}, {orderDetails.addressInfo?.state} {orderDetails.addressInfo?.pincode}
            </p>
            <p className="text-xs text-zinc-500 pt-1">
              Contact: {orderDetails.addressInfo?.phone}
            </p>
            {orderDetails.addressInfo?.notes && (
              <p className="text-[11px] text-zinc-500 italic pt-1">
                Note: {orderDetails.addressInfo.notes}
              </p>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 bg-white border border-zinc-200/70 rounded-sm space-y-2 text-xs">
            <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 mb-2">
              Financial Summary
            </h4>
            <div className="flex justify-between text-zinc-600">
              <span>Items Subtotal</span>
              <span className="font-medium text-[#121212]">₹{itemsTotal}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Standard Logistics</span>
              <span className="font-medium text-emerald-700">
                {orderDetails.shippingFee > 0 ? `₹${orderDetails.shippingFee}` : "Complimentary"}
              </span>
            </div>
            {orderDetails.cashHandlingFee > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>Cash Handling Fee</span>
                <span className="font-medium text-[#121212]">₹{orderDetails.cashHandlingFee}</span>
              </div>
            )}
            {orderDetails.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Promotional Privilege</span>
                <span className="font-semibold">-₹{orderDetails.discount}</span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-zinc-200 flex justify-between items-baseline">
              <span className="font-semibold uppercase tracking-wider text-xs text-[#121212]">
                Total Settled
              </span>
              <span className="font-serif text-lg font-bold text-[#121212]">
                ₹{orderDetails.totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Reason if present */}
        {orderDetails.cancellation?.requested && (
          <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-sm text-xs space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 block">
              Cancellation File Note
            </span>
            <p className="text-zinc-700">{orderDetails.cancellation.reason}</p>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
