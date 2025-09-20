import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import ShoppingOrderDetailsView from "./order-details";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "rejected":
        return "bg-red-600";
      case "delivered":
        return "bg-blue-600";
      default:
        return "bg-black";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {orderList && orderList.length > 0 ? (
        orderList.map((order) => {
          const product = order.cartItems?.[0]; // First product
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
                  {order.cartItems.length > 1 && (
                    <span className="text-sm text-muted-foreground">
                      + {order.cartItems.length - 1} more
                    </span>
                  )}
                </div>

                {/* Order status */}
                <div>
                  <Badge
                    className={`py-1 px-3 ${getStatusColor(order.orderStatus)}`}
                  >
                    {order.orderStatus}
                  </Badge>
                </div>

                {/* Total price */}
                <div className="text-lg font-semibold">
                  ₹{order.totalAmount}
                </div>

                {/* View Details Button and Dialog */}
                <Dialog
                  open={openDetailsDialog}
                  onOpenChange={() => {
                    setOpenDetailsDialog(false);
                    dispatch(resetOrderDetails());
                  }}
                >
                  <Button
                    onClick={() => handleFetchOrderDetails(order._id)}
                    className="w-full"
                  >
                    View Details
                  </Button>
                  <ShoppingOrderDetailsView orderDetails={orderDetails} />
                </Dialog>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <p className="text-center col-span-full">No orders found.</p>
      )}
    </div>
  );
}

export default ShoppingOrders;
