import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orderList && orderList.length > 0 ? (
        orderList.map((orderItem) => (
          <Card key={orderItem?._id} className="shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex justify-between items-center">
                <span className="truncate">Order #{orderItem?._id}</span>
                <Badge
                  className={`py-1 px-3 text-xs ${
                    orderItem?.orderStatus === "confirmed"
                      ? "bg-green-500"
                      : orderItem?.orderStatus === "rejected"
                      ? "bg-red-600"
                      : "bg-black"
                  }`}
                >
                  {orderItem?.orderStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{orderItem?.orderDate.split("T")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Price:</span>
                <span>₹{orderItem?.totalAmount}</span>
              </div>
              <div className="pt-2 flex justify-end">
                <Dialog
                  open={openDetailsDialog}
                  onOpenChange={() => {
                    setOpenDetailsDialog(false);
                    dispatch(resetOrderDetails());
                  }}
                >
                  <Button
                    size="sm"
                    onClick={() => handleFetchOrderDetails(orderItem?._id)}
                  >
                    View Details
                  </Button>
                  <AdminOrderDetailsView orderDetails={orderDetails} />
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center text-gray-500 col-span-full">
          No orders found
        </p>
      )}
    </div>
  );
}

export default AdminOrdersView;
