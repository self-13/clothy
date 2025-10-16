import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { X, RotateCcw, Clock, CheckCircle, XCircle } from "lucide-react";

function ShoppingOrderDetailsView({
  orderDetails,
  onCancellationRequest,
  onReturnRequest,
  canCancelOrder,
  canReturnOrder,
}) {
  const { user } = useSelector((state) => state.auth);

  // Add null check at the beginning
  if (!orderDetails) {
    return (
      <DialogContent className="sm:max-w-[650px]">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Order details not available.</p>
        </div>
      </DialogContent>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500 text-white";
      case "processing":
        return "bg-yellow-500 text-white";
      case "shipped":
        return "bg-blue-500 text-white";
      case "out_for_delivery":
        return "bg-purple-500 text-white";
      case "delivered":
        return "bg-green-600 text-white";
      case "cancelled":
        return "bg-red-600 text-white";
      case "returned":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-500 text-white";
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
          text: `Cancellation Requested (${requestedAt})`,
          color: "bg-yellow-500 text-white",
          icon: <Clock className="w-3 h-3 mr-1" />,
        };
      case "approved":
        return {
          text: `Cancellation Approved (${requestedAt})`,
          color: "bg-green-500 text-white",
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
        };
      case "rejected":
        return {
          text: `Cancellation Rejected (${requestedAt})`,
          color: "bg-red-500 text-white",
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
          text: `Return Requested (${requestedAt})`,
          color: "bg-yellow-500 text-white",
          icon: <Clock className="w-3 h-3 mr-1" />,
        };
      case "approved":
        return {
          text: `Return Approved (${requestedAt})`,
          color: "bg-green-500 text-white",
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
        };
      case "rejected":
        return {
          text: `Return Rejected (${requestedAt})`,
          color: "bg-red-500 text-white",
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

  // Calculate items total
  const itemsTotal =
    orderDetails.items?.reduce((total, item) => {
      return total + (item.salePrice || item.price) * item.quantity;
    }, 0) || 0;

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <div className="grid gap-6">
        {/* Header with Order ID */}
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
          <p className="text-sm text-gray-600 mt-1">
            Order #{orderDetails._id.slice(-8).toUpperCase()}
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge
            className={`py-2 px-4 text-sm font-medium ${getStatusColor(
              orderDetails.orderStatus
            )}`}
          >
            {orderDetails.orderStatus?.replace(/_/g, " ").toUpperCase()}
          </Badge>

          {cancellationStatus && (
            <Badge
              className={`py-2 px-4 text-sm font-medium flex items-center ${cancellationStatus.color}`}
            >
              {cancellationStatus.icon}
              {cancellationStatus.text}
            </Badge>
          )}

          {returnStatus && (
            <Badge
              className={`py-2 px-4 text-sm font-medium flex items-center ${returnStatus.color}`}
            >
              {returnStatus.icon}
              {returnStatus.text}
            </Badge>
          )}
        </div>

        {/* Order Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Order Date</p>
              <p className="text-sm text-gray-900">
                {new Date(orderDetails.orderDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Payment Method
              </p>
              <p className="text-sm text-gray-900 capitalize">
                {orderDetails.paymentMethod}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Payment Status
              </p>
              <p className="text-sm text-gray-900 capitalize">
                {orderDetails.paymentStatus}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm text-gray-900">
                {new Date(orderDetails.orderUpdateDate).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(showCancelButton || showReturnButton) && (
          <div className="flex gap-3">
            {showCancelButton && (
              <Button
                onClick={() => onCancellationRequest(orderDetails)}
                variant="destructive"
                className="flex-1 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Request Cancellation
              </Button>
            )}
            {showReturnButton && (
              <Button
                onClick={() => onReturnRequest(orderDetails)}
                variant="outline"
                className="flex-1 flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <RotateCcw className="w-4 h-4" />
                Request Return
              </Button>
            )}
          </div>
        )}

        <Separator />

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
          <div className="space-y-4">
            {orderDetails.items?.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">by {item.brand}</p>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-2 font-medium">
                        {item.selectedSize}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Color:</span>
                      <span className="ml-2 font-medium capitalize">
                        {item.selectedColor}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <span className="ml-2 font-medium">{item.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="ml-2 font-medium">
                        ₹{item.salePrice || item.price}
                      </span>
                    </div>
                  </div>

                  {/* Product Details from productDetails */}
                  {item.productDetails && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">
                        Product Information:
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-1 font-medium capitalize">
                            {item.productDetails.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Subcategory:</span>
                          <span className="ml-1 font-medium capitalize">
                            {item.productDetails.subcategory}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Available Colors:
                          </span>
                          <span className="ml-1 font-medium">
                            {item.productDetails.colors?.join(", ")}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Available Sizes:
                          </span>
                          <span className="ml-1 font-medium">
                            {item.productDetails.sizes
                              ?.map((s) => `${s.size}(${s.stock})`)
                              .join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ₹{(item.salePrice || item.price) * item.quantity}
                  </p>
                  {item.salePrice && item.salePrice < item.price && (
                    <p className="text-sm text-gray-500 line-through">
                      ₹{item.price * item.quantity}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Price Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Items Total:</span>
              <span className="font-medium">₹{itemsTotal}</span>
            </div>
            {orderDetails.shippingFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Fee:</span>
                <span className="font-medium">₹{orderDetails.shippingFee}</span>
              </div>
            )}
            {orderDetails.cashHandlingFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Cash Handling Fee:</span>
                <span className="font-medium">
                  ₹{orderDetails.cashHandlingFee}
                </span>
              </div>
            )}
            {orderDetails.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-₹{orderDetails.discount}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>₹{orderDetails.totalAmount}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Shipping Address */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Shipping Address
          </h3>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {user?.userName || user?.name || "Customer"}
              </p>
              <p className="text-gray-600">
                {orderDetails.addressInfo?.address}
              </p>
              <p className="text-gray-600">{orderDetails.addressInfo?.city}</p>
              <p className="text-gray-600">
                Pincode: {orderDetails.addressInfo?.pincode}
              </p>
              <p className="text-gray-600">
                Phone: {orderDetails.addressInfo?.phone}
              </p>
              {orderDetails.addressInfo?.type && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Address Type:</span>
                  <Badge variant="outline" className="capitalize">
                    {orderDetails.addressInfo.type}
                  </Badge>
                </div>
              )}
              {orderDetails.addressInfo?.notes && (
                <div className="mt-2 p-2 bg-white rounded border">
                  <p className="text-xs text-gray-600 mb-1">Delivery Notes:</p>
                  <p className="text-sm">{orderDetails.addressInfo.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancellation Details */}
        {orderDetails.cancellation?.requested && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Cancellation Details
              </h3>
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requested On:</span>
                    <span className="font-medium">
                      {new Date(
                        orderDetails.cancellation.requestedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Reason:</span>
                    <p className="font-medium mt-1">
                      {orderDetails.cancellation.reason}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      className={cancellationStatus?.color || "bg-gray-500"}
                    >
                      {orderDetails.cancellation.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
