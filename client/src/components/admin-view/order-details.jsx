import { useState, useEffect } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { CheckCircle, Clock, MapPin, X, Package } from "lucide-react";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails, onClose }) {
  const [formData, setFormData] = useState(initialFormData);
  const { isLoading } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Set current status in form when orderDetails changes
  useEffect(() => {
    if (orderDetails?.orderStatus) {
      setFormData({
        status: orderDetails.orderStatus,
      });
    }
  }, [orderDetails]);

  const getBadgeColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500 text-white";
      case "processing":
        return "bg-yellow-500 text-white";
      case "shipped":
        return "bg-purple-500 text-white";
      case "out_for_delivery":
        return "bg-orange-500 text-white";
      case "delivered":
        return "bg-green-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      case "returned":
        return "bg-pink-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPaymentBadgeColor = (method) => {
    return method === "cod"
      ? "bg-orange-500 text-white"
      : "bg-teal-500 text-white";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "shipped":
        return <Package className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    if (!status) {
      toast({
        title: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    const updateData = { orderStatus: status };

    // If status is delivered, set delivery date
    if (status === "delivered") {
      updateData.deliveryDate = new Date().toISOString();
    }

    dispatch(
      updateOrderStatus({
        id: orderDetails?._id,
        ...updateData,
      })
    )
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(getOrderDetailsForAdmin(orderDetails?._id));
          dispatch(getAllOrdersForAdmin());
          toast({
            title: "Status updated successfully!",
          });
        } else {
          toast({
            title: "Error updating status",
            description: data?.payload?.message || "Please try again",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Update status error:", error);
        toast({
          title: "Error updating status",
          description: error.message,
          variant: "destructive",
        });
      });
  }

  // Order timeline
  const getOrderTimeline = () => {
    const timeline = [
      {
        status: "confirmed",
        title: "Order Confirmed",
        date: orderDetails?.orderDate,
        completed: true,
        icon: <CheckCircle className="h-4 w-4" />,
      },
      {
        status: "processing",
        title: "Processing",
        date: [
          "processing",
          "shipped",
          "out_for_delivery",
          "delivered",
        ].includes(orderDetails?.orderStatus)
          ? orderDetails?.orderUpdateDate
          : null,
        completed: [
          "processing",
          "shipped",
          "out_for_delivery",
          "delivered",
        ].includes(orderDetails?.orderStatus),
        icon: <Package className="h-4 w-4" />,
      },
      {
        status: "shipped",
        title: "Shipped",
        date: ["shipped", "out_for_delivery", "delivered"].includes(
          orderDetails?.orderStatus
        )
          ? orderDetails?.orderUpdateDate
          : null,
        completed: ["shipped", "out_for_delivery", "delivered"].includes(
          orderDetails?.orderStatus
        ),
        icon: <Package className="h-4 w-4" />,
      },
      {
        status: "out_for_delivery",
        title: "Out for Delivery",
        date: ["out_for_delivery", "delivered"].includes(
          orderDetails?.orderStatus
        )
          ? orderDetails?.orderUpdateDate
          : null,
        completed: ["out_for_delivery", "delivered"].includes(
          orderDetails?.orderStatus
        ),
        icon: <MapPin className="h-4 w-4" />,
      },
      {
        status: "delivered",
        title: "Delivered",
        date: orderDetails?.deliveryDate,
        completed: orderDetails?.orderStatus === "delivered",
        icon: <CheckCircle className="h-4 w-4" />,
      },
    ];

    return timeline;
  };

  return (
    <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
      <div className="relative">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="grid gap-6 pt-4">
          {/* Header Section */}
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Order Details</h2>
              <div className="flex gap-2">
                <Badge
                  className={getPaymentBadgeColor(orderDetails?.paymentMethod)}
                >
                  {orderDetails?.paymentMethod?.toUpperCase()}
                </Badge>
                <Badge className={getBadgeColor(orderDetails?.orderStatus)}>
                  {orderDetails?.orderStatus?.replace(/_/g, " ").toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <span className="font-medium text-sm text-muted-foreground">
                  Order ID
                </span>
                <Label className="font-mono text-sm">
                  {orderDetails?._id?.slice(-8)}
                </Label>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-muted-foreground">
                  Order Date
                </span>
                <Label>
                  {new Date(orderDetails?.orderDate).toLocaleDateString()}
                </Label>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-muted-foreground">
                  Total Amount
                </span>
                <Label className="text-lg font-bold">
                  ₹{orderDetails?.totalAmount?.toFixed(2)}
                </Label>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-muted-foreground">
                  Payment Status
                </span>
                <Label className="capitalize">
                  {orderDetails?.paymentStatus}
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Timeline */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg">Order Timeline</h3>
            <div className="space-y-4">
              {getOrderTimeline().map((step, index) => (
                <div key={step.status} className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-medium ${
                          step.completed ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </span>
                      {step.date && (
                        <span className="text-sm text-muted-foreground">
                          {new Date(step.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Items Section */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg">Order Items</h3>
            <div className="space-y-3">
              {orderDetails?.items && orderDetails?.items.length > 0 ? (
                orderDetails.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded overflow-hidden border">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      {item.brand && (
                        <p className="text-sm text-muted-foreground">
                          Brand: {item.brand}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {item.selectedSize && (
                          <span>Size: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span>Color: {item.selectedColor}</span>
                        )}
                      </div>
                      <p className="text-sm">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                        {item.salePrice && item.salePrice < item.price && (
                          <span className="text-muted-foreground line-through ml-2">
                            ₹{(item.salePrice * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price}</p>
                      {item.salePrice && item.salePrice < item.price && (
                        <p className="text-sm text-muted-foreground line-through">
                          ₹{item.salePrice}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">each</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No items found.</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Shipping Info */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg">Shipping Information</h3>
            <div className="grid gap-2 p-3 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-sm text-muted-foreground">
                    Customer Name
                  </span>
                  <p className="text-sm font-medium">
                    {orderDetails?.addressInfo?.name || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-sm text-muted-foreground">
                    Phone
                  </span>
                  <p className="text-sm">{orderDetails?.addressInfo?.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-sm text-muted-foreground">
                    Address
                  </span>
                  <p className="text-sm">
                    {orderDetails?.addressInfo?.address}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-sm text-muted-foreground">
                    City
                  </span>
                  <p className="text-sm">{orderDetails?.addressInfo?.city}</p>
                </div>
                <div>
                  <span className="font-medium text-sm text-muted-foreground">
                    Pincode
                  </span>
                  <p className="text-sm">
                    {orderDetails?.addressInfo?.pincode}
                  </p>
                </div>
              </div>
              {orderDetails?.addressInfo?.notes && (
                <div>
                  <span className="font-medium text-sm text-muted-foreground">
                    Delivery Notes
                  </span>
                  <p className="text-sm">{orderDetails?.addressInfo?.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation/Return Info */}
          {(orderDetails?.cancellation?.requested ||
            orderDetails?.return?.requested) && (
            <>
              <Separator />
              <div className="grid gap-4">
                <h3 className="font-semibold text-lg">Customer Requests</h3>
                {orderDetails.cancellation?.requested && (
                  <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Cancellation Request</span>
                    </div>
                    <p className="text-sm mt-1">
                      Reason: {orderDetails.cancellation.reason}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Requested on:{" "}
                      {new Date(
                        orderDetails.cancellation.requestedAt
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-orange-600">
                      Status: {orderDetails.cancellation.status}
                    </p>
                  </div>
                )}
                {orderDetails.return?.requested && (
                  <div className="p-3 border border-pink-200 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-2 text-pink-800">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">Return Request</span>
                    </div>
                    <p className="text-sm mt-1">
                      Reason: {orderDetails.return.reason}
                    </p>
                    <p className="text-xs text-pink-600 mt-1">
                      Requested on:{" "}
                      {new Date(
                        orderDetails.return.requestedAt
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-pink-600">
                      Status: {orderDetails.return.status}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Update Status Form */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Update Order Status</h3>
            <CommonForm
              formControls={[
                {
                  label: "Order Status",
                  name: "status",
                  componentType: "select",
                  options: [
                    { id: "confirmed", label: "Confirmed" },
                    { id: "processing", label: "Processing" },
                    { id: "shipped", label: "Shipped" },
                    { id: "out_for_delivery", label: "Out for Delivery" },
                    { id: "delivered", label: "Delivered" },
                    { id: "cancelled", label: "Cancelled" },
                  ],
                },
              ]}
              formData={formData}
              setFormData={setFormData}
              buttonText={isLoading ? "Updating..." : "Update Status"}
              onSubmit={handleUpdateStatus}
              isBtnDisabled={!formData.status || isLoading}
            />
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
