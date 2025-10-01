import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

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
        return "bg-gray-500";
    }
  };

  const getCancellationStatus = (order) => {
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
  };

  const getReturnStatus = (order) => {
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
  };

  const cancellationStatus = getCancellationStatus(orderDetails);
  const returnStatus = getReturnStatus(orderDetails);
  const showCancelButton = canCancelOrder(orderDetails);
  const showReturnButton = canReturnOrder(orderDetails);

  return (
    <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
      <div className="grid gap-6">
        {/* Order Info */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails._id}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>
              {new Date(orderDetails.orderDate).toLocaleDateString()}
            </Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>₹{orderDetails.totalAmount}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Payment Method</p>
            <Label className="uppercase">{orderDetails.paymentMethod}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label className="capitalize">{orderDetails.paymentStatus}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Badge
              className={`py-1 px-3 capitalize ${getStatusColor(
                orderDetails.orderStatus
              )}`}
            >
              {orderDetails.orderStatus?.replace("_", " ")}
            </Badge>
          </div>

          {/* Cancellation Status */}
          {cancellationStatus && (
            <div className="flex items-center justify-between">
              <p className="font-medium">Cancellation Status</p>
              <Badge className={`py-1 px-3 ${cancellationStatus.color}`}>
                {cancellationStatus.text}
              </Badge>
            </div>
          )}

          {/* Return Status */}
          {returnStatus && (
            <div className="flex items-center justify-between">
              <p className="font-medium">Return Status</p>
              <Badge className={`py-1 px-3 ${returnStatus.color}`}>
                {returnStatus.text}
              </Badge>
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        {(showCancelButton || showReturnButton) && (
          <>
            <div className="flex gap-2">
              {showCancelButton && (
                <Button
                  onClick={() => onCancellationRequest(orderDetails)}
                  variant="destructive"
                  className="flex-1"
                >
                  Request Cancellation
                </Button>
              )}
              {showReturnButton && (
                <Button
                  onClick={() => onReturnRequest(orderDetails)}
                  variant="outline"
                  className="flex-1"
                >
                  Request Return
                </Button>
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Order Items */}
        <div className="grid gap-4">
          <div className="font-medium">Products</div>
          <ul className="grid gap-4">
            {orderDetails.cartItems?.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-4 border-b pb-3"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.selectedSize && (
                      <p className="text-sm text-muted-foreground">
                        Size: {item.selectedSize}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right font-medium">₹{item.price}</div>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Shipping Info */}
        <div className="grid gap-2">
          <div className="font-medium">Shipping Info</div>
          <div className="grid gap-0.5 text-muted-foreground">
            <span>{user?.userName}</span>
            <span>{orderDetails.addressInfo?.address}</span>
            <span>{orderDetails.addressInfo?.city}</span>
            <span>{orderDetails.addressInfo?.pincode}</span>
            <span>{orderDetails.addressInfo?.phone}</span>
            {orderDetails.addressInfo?.notes && (
              <span>Notes: {orderDetails.addressInfo?.notes}</span>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
