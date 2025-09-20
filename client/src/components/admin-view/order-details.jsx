import { useState } from "react";
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

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const getBadgeColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "inProcess":
        return "bg-blue-500";
      case "inShipping":
        return "bg-indigo-500";
      case "delivered":
        return "bg-purple-500";
      case "rejected":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentBadgeColor = (method) => {
    return method === "cod" ? "bg-orange-500" : "bg-teal-500";
  };

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <div className="grid gap-6">
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
                {orderDetails?.orderStatus}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="font-medium text-sm text-muted-foreground">
                Order ID
              </span>
              <Label className="text-base">{orderDetails?._id}</Label>
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
              <Label>{orderDetails?.paymentStatus}</Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Order Items Section */}
        <div className="grid gap-4">
          <h3 className="font-semibold text-lg">Order Items</h3>
          <div className="space-y-3">
            {orderDetails?.cartItems && orderDetails?.cartItems.length > 0 ? (
              orderDetails.cartItems.map((item, index) => (
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
                    {item.selectedSize && (
                      <p className="text-sm text-muted-foreground">
                        Size: {item.selectedSize}
                      </p>
                    )}
                    <p className="text-sm">Qty: {item.quantity}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-semibold">₹{item.price}</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-sm text-muted-foreground">
                  Address
                </span>
                <p className="text-sm">{orderDetails?.addressInfo?.address}</p>
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
                <p className="text-sm">{orderDetails?.addressInfo?.pincode}</p>
              </div>
              <div>
                <span className="font-medium text-sm text-muted-foreground">
                  Phone
                </span>
                <p className="text-sm">{orderDetails?.addressInfo?.phone}</p>
              </div>
            </div>
            {orderDetails?.addressInfo?.notes && (
              <div>
                <span className="font-medium text-sm text-muted-foreground">
                  Notes
                </span>
                <p className="text-sm">{orderDetails?.addressInfo?.notes}</p>
              </div>
            )}
          </div>
        </div>

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
                  { id: "pending", label: "Pending" },
                  { id: "confirmed", label: "Confirmed" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
