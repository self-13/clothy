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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import ShoppingOrderDetailsView from "./order-details";
import { Badge } from "../ui/badge";
import ReasonFormDialog from "./reason-form-dialog";
import { Package, Calendar, Eye, X, RotateCcw, Clock, CheckCircle, XCircle } from "lucide-react";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openCancellationDialog, setOpenCancellationDialog] = useState(false);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails, isLoading } = useSelector(
    (state) => state.shopOrder
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user.id));
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
      await dispatch(
        requestOrderCancellation({
          orderId: selectedOrder._id,
          reason,
        })
      );
      setOpenCancellationDialog(false);
      setSelectedOrder(null);
    }
  };

  const submitReturnRequest = async (reason) => {
    if (selectedOrder) {
      await dispatch(
        requestOrderReturn({
          orderId: selectedOrder._id,
          reason,
        })
      );
      setOpenReturnDialog(false);
      setSelectedOrder(null);
    }
  };

  // Check if order can be cancelled (within 3 days of order creation)
  const canCancelOrder = (order) => {
    if (!order) return false;
    if (!["confirmed", "processing"].includes(order.orderStatus)) return false;
    if (order.cancellation?.requested) return false; // Already requested

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
    if (order.return?.requested) return false; // Already requested

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

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      case "returned":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
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
          text: "Cancellation Requested",
          color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          icon: <Clock className="w-3 h-3 mr-1" />
        };
      case "approved":
        return {
          text: "Cancellation Approved",
          color: "bg-green-100 text-green-800 border border-green-200",
          icon: <CheckCircle className="w-3 h-3 mr-1" />
        };
      case "rejected":
        return {
          text: "Cancellation Rejected",
          color: "bg-red-100 text-red-800 border border-red-200",
          icon: <XCircle className="w-3 h-3 mr-1" />
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
          text: "Return Requested",
          color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          icon: <Clock className="w-3 h-3 mr-1" />
        };
      case "approved":
        return {
          text: "Return Approved",
          color: "bg-green-100 text-green-800 border border-green-200",
          icon: <CheckCircle className="w-3 h-3 mr-1" />
        };
      case "rejected":
        return {
          text: "Return Rejected",
          color: "bg-red-100 text-red-800 border border-red-200",
          icon: <XCircle className="w-3 h-3 mr-1" />
        };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            My Orders
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track and manage your orders
          </p>
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

        {/* Orders Grid */}
        {orderList && orderList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {orderList.map((order) => {
              const product = order.items?.[0];
              const cancellationBadge = getCancellationBadge(order);
              const returnBadge = getReturnBadge(order);
              const showCancelButton = canCancelOrder(order);
              const showReturnButton = canReturnOrder(order);

              return (
                <Card
                  key={order._id}
                  className="flex flex-col justify-between border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </CardTitle>
                        <Badge
                          className={`${getStatusColor(
                            order.orderStatus
                          )} text-xs sm:text-sm`}
                        >
                          {getStatusText(order.orderStatus)}
                        </Badge>
                      </div>
                      
                      {/* Cancellation/Return Badges */}
                      <div className="flex flex-wrap gap-1">
                        {cancellationBadge && (
                          <Badge className={`text-xs flex items-center ${cancellationBadge.color}`}>
                            {cancellationBadge.icon}
                            {cancellationBadge.text}
                          </Badge>
                        )}
                        {returnBadge && (
                          <Badge className={`text-xs flex items-center ${returnBadge.color}`}>
                            {returnBadge.icon}
                            {returnBadge.text}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      {new Date(order.orderDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </CardHeader>

                  {/* Rest of the card content remains the same */}
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    {/* Product Info */}
                    <div className="flex space-x-3 sm:space-x-4">
                      {product?.image && (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {product?.title}
                        </h3>
                        {order.items.length > 1 && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            + {order.items.length - 1} more item(s)
                          </p>
                        )}
                        <div className="flex items-center mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {order.items.reduce(
                            (total, item) => total + item.quantity,
                            0
                          )}{" "}
                          items
                        </div>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-xs sm:text-sm font-medium text-gray-600">
                        Total Amount:
                      </span>
                      <span className="text-base sm:text-lg font-bold text-gray-900">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <Button
                        onClick={() => handleFetchOrderDetails(order._id)}
                        className="w-full bg-black text-white hover:bg-gray-800 border border-black text-sm"
                        variant="default"
                        size="sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        View Details
                      </Button>

                      {/* Action Buttons Row */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        {showCancelButton && (
                          <Button
                            onClick={() => handleCancellationRequest(order)}
                            className="flex-1 bg-red-500 text-white border border-red-500 hover:bg-red-600 text-xs sm:text-sm"
                            variant="destructive"
                            size="sm"
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Cancel Order
                          </Button>
                        )}

                        {showReturnButton && (
                          <Button
                            onClick={() => handleReturnRequest(order)}
                            className="flex-1 bg-orange-500 text-white border border-orange-500 hover:bg-orange-600 text-xs sm:text-sm"
                            size="sm"
                          >
                            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Return Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              You haven't placed any orders yet.
            </p>
          </div>
        )}
      </div>

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