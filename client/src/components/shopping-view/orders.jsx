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

    // Check if cancellation is already requested (you might need to add this field to your API)
    // if (order.cancellation?.requested) return false;

    if (!["confirmed", "processing"].includes(order.orderStatus)) return false;

    const orderDate = new Date(order.orderDate);
    const threeDaysLater = new Date(
      orderDate.getTime() + 3 * 24 * 60 * 60 * 1000
    );
    return new Date() <= threeDaysLater;
  };

  // Check if order can be returned (within 1 week of delivery OR within 15 days of order creation)
  const canReturnOrder = (order) => {
    if (!order) return false;

    // Check if return is already requested (you might need to add this field to your API)
    // if (order.return?.requested) return false;

    if (order.orderStatus !== "delivered") return false;

    const orderDate = new Date(order.orderDate);
    const fifteenDaysFromOrder = new Date(
      orderDate.getTime() + 15 * 24 * 60 * 60 * 1000
    );

    // Use delivery date if available, otherwise use order date + 15 days
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
        return "bg-green-500";
      case "processing":
        return "bg-yellow-500";
      case "shipped":
        return "bg-blue-500";
      case "out_for_delivery":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-600";
      case "cancelled":
        return "bg-red-600";
      case "returned":
        return "bg-gray-600";
      default:
        return "bg-black";
    }
  };

  // These functions might need to be updated based on your actual API response
  const getCancellationStatus = (order) => {
    // Uncomment and modify when your API supports cancellation status
    /*
    if (!order?.cancellation?.requested) return null;

    switch (order.cancellation.status) {
      case "pending":
        return { text: "Cancellation Requested", color: "bg-yellow-500" };
      case "approved":
        return { text: "Cancellation Approved", color: "bg-green-500" };
      case "rejected":
        return { text: "Cancellation Rejected", color: "bg-red-500" };
      default:
        return null;
    }
    */
    return null;
  };

  const getReturnStatus = (order) => {
    // Uncomment and modify when your API supports return status
    /*
    if (!order?.return?.requested) return null;

    switch (order.return.status) {
      case "pending":
        return { text: "Return Requested", color: "bg-yellow-500" };
      case "approved":
        return { text: "Return Approved", color: "bg-green-500" };
      case "rejected":
        return { text: "Return Rejected", color: "bg-red-500" };
      default:
        return null;
    }
    */
    return null;
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orderList && orderList.length > 0 ? (
          orderList.map((order) => {
            const product = order.items?.[0]; // Use items instead of cartItems
            const cancellationStatus = getCancellationStatus(order);
            const returnStatus = getReturnStatus(order);
            const showCancelButton = canCancelOrder(order);
            const showReturnButton = canReturnOrder(order);

            return (
              <Card key={order._id} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Order #{order._id.slice(-6)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Product image */}
                  {product?.image && (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  )}

                  {/* Product title and quantity */}
                  <div className="text-md font-medium">
                    {product?.title}{" "}
                    {order.items.length > 1 && (
                      <span className="text-sm text-muted-foreground">
                        + {order.items.length - 1} more
                      </span>
                    )}
                  </div>

                  {/* Order status */}
                  <div className="space-y-2">
                    <Badge
                      className={`py-1 px-3 ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.replace("_", " ")}
                    </Badge>

                    {/* Cancellation Status */}
                    {cancellationStatus && (
                      <Badge
                        className={`py-1 px-3 ${cancellationStatus.color}`}
                      >
                        {cancellationStatus.text}
                      </Badge>
                    )}

                    {/* Return Status */}
                    {returnStatus && (
                      <Badge className={`py-1 px-3 ${returnStatus.color}`}>
                        {returnStatus.text}
                      </Badge>
                    )}
                  </div>

                  {/* Total price */}
                  <div className="text-lg font-semibold">
                    ₹{order.totalAmount}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleFetchOrderDetails(order._id)}
                      className="w-full"
                      variant="outline"
                    >
                      View Details
                    </Button>

                    {/* Cancellation Button */}
                    {/* {showCancelButton && (
                      <Button
                        onClick={() => handleCancellationRequest(order)}
                        className="w-full"
                        variant="destructive"
                      >
                        Request Cancellation
                      </Button>
                    )} */}

                    {/* Return Button */}
                    {/* {showReturnButton && (
                      <Button
                        onClick={() => handleReturnRequest(order)}
                        className="w-full"
                        variant="outline"
                      >
                        Request Return
                      </Button>
                    )} */}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-center col-span-full">No orders found.</p>
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
