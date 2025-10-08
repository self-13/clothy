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
import { Package, Calendar, Eye, X, RotateCcw } from "lucide-react";

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
        return "bg-gray-100 text-gray-800 border border-gray-300";
      case "processing":
        return "bg-blue-50 text-blue-800 border border-blue-200";
      case "shipped":
        return "bg-purple-50 text-purple-800 border border-purple-200";
      case "out_for_delivery":
        return "bg-orange-50 text-orange-800 border border-orange-200";
      case "delivered":
        return "bg-green-50 text-green-800 border border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-800 border border-red-200";
      case "returned":
        return "bg-gray-100 text-gray-800 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getStatusText = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // These functions might need to be updated based on your actual API response
  const getCancellationStatus = (order) => {
    return null;
  };

  const getReturnStatus = (order) => {
    return null;
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orderList.map((order) => {
              const product = order.items?.[0];
              const cancellationStatus = getCancellationStatus(order);
              const returnStatus = getReturnStatus(order);
              const showCancelButton = canCancelOrder(order);
              const showReturnButton = canReturnOrder(order);

              return (
                <Card 
                  key={order._id} 
                  className="flex flex-col justify-between border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <CardTitle className="text-lg font-semibold text-black">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <Badge className={getStatusColor(order.orderStatus)}>
                        {getStatusText(order.orderStatus)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(order.orderDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Product Info */}
                    <div className="flex space-x-4">
                      {product?.image && (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-black truncate">
                          {product?.title}
                        </h3>
                        {order.items.length > 1 && (
                          <p className="text-sm text-gray-600 mt-1">
                            + {order.items.length - 1} more item(s)
                          </p>
                        )}
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Package className="w-4 h-4 mr-1" />
                          {order.items.reduce((total, item) => total + item.quantity, 0)} items
                        </div>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                      <span className="text-lg font-bold text-black">₹{order.totalAmount}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <Button
                        onClick={() => handleFetchOrderDetails(order._id)}
                        className="w-full bg-black text-white hover:bg-gray-800 border border-black"
                        variant="default"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>

                      {/* Action Buttons Row */}
                      <div className="flex space-x-2">
                        {showCancelButton && (
                          <Button
                            onClick={() => handleCancellationRequest(order)}
                            className="flex-1 bg-white text-black border border-gray-300 hover:bg-gray-50"
                            variant="outline"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        
                        {showReturnButton && (
                          <Button
                            onClick={() => handleReturnRequest(order)}
                            className="flex-1 bg-white text-black border border-gray-300 hover:bg-gray-50"
                            variant="outline"
                            size="sm"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Return
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
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">You haven't placed any orders yet.</p>
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