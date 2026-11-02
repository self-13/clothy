import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
  requestOrderCancellation,
  requestOrderReturn,
} from "@/store/shop/order-slice";

import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import ShoppingOrderDetailsView from "./order-details";
import { Badge } from "../ui/badge";
import ReasonFormDialog from "./reason-form-dialog";
import { Package, Calendar, Eye, X, RotateCcw, Clock, CheckCircle, XCircle, ArrowUpRight } from "lucide-react";
import { useToast } from "../ui/use-toast";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openCancellationDialog, setOpenCancellationDialog] = useState(false);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails, isLoading } = useSelector(
    (state) => state.shopOrder
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId());
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (orderDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [orderDetails]);

  const handleFetchOrderDetails = (orderId) => {
    dispatch(getOrderDetails(orderId));
  };

  const handleCancellationRequest = (order) => {
    setSelectedOrder(order);
    setOpenCancellationDialog(true);
  };

  const handleReturnRequest = (order) => {
    setSelectedOrder(order);
    setOpenReturnDialog(true);
  };

  const submitCancellationRequest = async (reason) => {
    if (selectedOrder) {
      const res = await dispatch(
        requestOrderCancellation({
          orderId: selectedOrder._id,
          reason,
        })
      );
      setOpenCancellationDialog(false);
      setSelectedOrder(null);
      if (res?.payload?.success) {
        toast({
          title: "Cancellation Request Submitted",
          description: "Our concierge team will review and confirm your request.",
        });
      } else {
        toast({
          title: res?.payload?.message || "Failed to submit cancellation request",
          variant: "destructive",
        });
      }
    }
  };

  const submitReturnRequest = async (reason) => {
    if (selectedOrder) {
      const res = await dispatch(
        requestOrderReturn({
          orderId: selectedOrder._id,
          reason,
        })
      );
      setOpenReturnDialog(false);
      setSelectedOrder(null);
      if (res?.payload?.success) {
        toast({
          title: "Return Request Submitted",
          description: "Our concierge team will review and process reverse logistics.",
        });
      } else {
        toast({
          title: res?.payload?.message || "Failed to submit return request",
          variant: "destructive",
        });
      }
    }
  };

  // Check if order can be cancelled (within 3 days of order creation)
  const canCancelOrder = (order) => {
    if (!order) return false;
    if (!["confirmed", "processing"].includes(order.orderStatus)) return false;
    if (order.cancellation?.requested) return false;

    const orderDate = new Date(order.orderDate);
    const threeDaysLater = new Date(
      orderDate.getTime() + 3 * 24 * 60 * 60 * 1000
    );
    return new Date() <= threeDaysLater;
  };

  // Check if order can be returned (within 1 week of delivery OR within 15 days of order creation)
  const canReturnOrder = (order) => {
    if (!order) return false;
    if (order.orderStatus !== "delivered") return false;
    if (order.return?.requested) return false;

    const orderDate = new Date(order.orderDate);
    const fifteenDaysFromOrder = new Date(
      orderDate.getTime() + 15 * 24 * 60 * 60 * 1000
    );

    const deliveryDate = order.deliveryDate
      ? new Date(order.deliveryDate)
      : orderDate;
    const oneWeekFromDelivery = new Date(
      deliveryDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    return (
      new Date() <= oneWeekFromDelivery && new Date() <= fifteenDaysFromOrder
    );
  };

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

  const getStatusText = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getCancellationBadge = (order) => {
    if (!order?.cancellation?.requested) return null;

    const status = order.cancellation.status;
    switch (status) {
      case "pending":
        return {
          text: "Cancellation Pending",
          style: "bg-amber-50 text-amber-800 border-amber-200/80",
          icon: <Clock className="w-3 h-3 mr-1" />,
        };
      case "approved":
        return {
          text: "Cancellation Approved",
          style: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
        };
      case "rejected":
        return {
          text: "Cancellation Declined",
          style: "bg-rose-50 text-rose-800 border-rose-200/80",
          icon: <XCircle className="w-3 h-3 mr-1" />,
        };
      default:
        return null;
    }
  };

  const getReturnBadge = (order) => {
    if (!order?.return?.requested) return null;

    const status = order.return.status;
    switch (status) {
      case "pending":
        return {
          text: "Return Pending",
          style: "bg-amber-50 text-amber-800 border-amber-200/80",
          icon: <Clock className="w-3 h-3 mr-1" />,
        };
      case "approved":
        return {
          text: "Return Approved",
          style: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
        };
      case "rejected":
        return {
          text: "Return Declined",
          style: "bg-rose-50 text-rose-800 border-rose-200/80",
          icon: <XCircle className="w-3 h-3 mr-1" />,
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-zinc-200/70">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block mb-1">
            Archive & Orders
          </span>
          <h2 className="font-serif text-2xl text-[#121212]">
            Order History
          </h2>
        </div>
        <div className="text-xs text-zinc-500 font-sans tracking-wide">
          {orderList?.length || 0} order{orderList?.length === 1 ? "" : "s"} placed
        </div>
      </div>

      {/* Reason Form Dialogs */}
      <ReasonFormDialog
        open={openCancellationDialog}
        onOpenChange={setOpenCancellationDialog}
        onSubmit={submitCancellationRequest}
        type="cancellation"
        isLoading={isLoading}
      />

      <ReasonFormDialog
        open={openReturnDialog}
        onOpenChange={setOpenReturnDialog}
        onSubmit={submitReturnRequest}
        type="return"
        isLoading={isLoading}
      />

      {/* Orders Grid / List */}
      {orderList && orderList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orderList.map((order) => {
            const product = order.items?.[0];
            const cancellationBadge = getCancellationBadge(order);
            const returnBadge = getReturnBadge(order);
            const showCancelButton = canCancelOrder(order);
            const showReturnButton = canReturnOrder(order);
            const statusConfig = getStatusBadge(order.orderStatus);

            return (
              <div
                key={order._id}
                className="bg-white border border-zinc-200/80 rounded-sm p-5 flex flex-col justify-between hover:border-zinc-300 transition-all duration-200 shadow-xs"
              >
                <div>
                  {/* Card Header: Order ID + Status */}
                  <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-zinc-100">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 block">
                        Order Identifier
                      </span>
                      <p className="font-mono text-xs font-semibold text-[#121212] tracking-wider mt-0.5">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-sm border ${statusConfig.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      {getStatusText(order.orderStatus)}
                    </span>
                  </div>

                  {/* Special Status Badges */}
                  {(cancellationBadge || returnBadge) && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {cancellationBadge && (
                        <span
                          className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-sm border ${cancellationBadge.style}`}
                        >
                          {cancellationBadge.icon}
                          {cancellationBadge.text}
                        </span>
                      )}
                      {returnBadge && (
                        <span
                          className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-sm border ${returnBadge.style}`}
                        >
                          {returnBadge.icon}
                          {returnBadge.text}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center text-xs text-zinc-500 mb-4">
                    <Calendar className="w-3.5 h-3.5 mr-2 text-zinc-400" />
                    <span>
                      {new Date(order.orderDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Primary Item Preview */}
                  <div className="flex items-center gap-3.5 p-2.5 bg-[#FAF9F6] rounded-sm border border-zinc-100 mb-4">
                    {product?.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-14 h-16 object-contain bg-white rounded-xs border border-zinc-200/60 p-1 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-16 bg-zinc-100 rounded-xs flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-zinc-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif text-xs text-[#121212] truncate">
                        {product?.title || "Luxury Garment"}
                      </h4>
                      {order.items?.length > 1 && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          + {order.items.length - 1} additional item{order.items.length - 1 === 1 ? "" : "s"}
                        </p>
                      )}
                      <p className="text-[11px] font-medium text-zinc-500 mt-1">
                        {order.items?.reduce((tot, it) => tot + it.quantity, 0)} unit(s) total
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer: Amount & Actions */}
                <div className="pt-3 border-t border-zinc-100 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                      Total Payable
                    </span>
                    <span className="font-serif text-base font-semibold text-[#121212]">
                      ₹{order.totalAmount}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleFetchOrderDetails(order._id)}
                      className="w-full py-2.5 px-4 bg-[#121212] hover:bg-black text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.14em] rounded-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <Eye className="w-3.5 h-3.5 stroke-[1.8]" />
                      <span>View Dossier</span>
                    </button>

                    {(showCancelButton || showReturnButton) && (
                      <div className="flex gap-2">
                        {showCancelButton && (
                          <button
                            onClick={() => handleCancellationRequest(order)}
                            className="flex-1 py-1.5 px-3 border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-medium rounded-sm transition-colors flex items-center justify-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        )}
                        {showReturnButton && (
                          <button
                            onClick={() => handleReturnRequest(order)}
                            className="flex-1 py-1.5 px-3 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-[11px] font-medium rounded-sm transition-colors flex items-center justify-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Return</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#FAF9F6] border border-zinc-200/70 rounded-sm">
          <Package className="w-12 h-12 text-zinc-400 mx-auto mb-4 stroke-[1.3]" />
          <h3 className="font-serif text-xl text-[#121212] mb-1">
            No Orders on Record
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
            Your acquisition history is currently pristine. Explore our ready-to-wear collections to place your inaugural order.
          </p>
          <a
            href="/shop/listing"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#121212] text-white hover:bg-black text-xs font-medium uppercase tracking-[0.14em] rounded-sm transition-all active:scale-[0.98]"
          >
            <span>Explore Collection</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onOpenChange={() => {
          setOpenDetailsDialog(false);
          dispatch(resetOrderDetails());
        }}
      >
        {orderDetails && (
          <ShoppingOrderDetailsView
            orderDetails={orderDetails}
            onCancellationRequest={handleCancellationRequest}
            onReturnRequest={handleReturnRequest}
            canCancelOrder={canCancelOrder}
            canReturnOrder={canReturnOrder}
          />
        )}
      </Dialog>
    </div>
  );
}

export default ShoppingOrders;