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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Search, Filter, ArrowUpDown } from "lucide-react";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [filters, setFilters] = useState({
    paymentMethod: "all",
    orderStatus: "all",
    search: "",
    sortBy: "newest",
  });

  const { orderList, orderDetails, isLoading } = useSelector(
    (state) => state.adminOrder
  );
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

  const filteredAndSortedOrders = orderList
    ?.filter((order) => {
      if (
        filters.paymentMethod !== "all" &&
        order.paymentMethod !== filters.paymentMethod
      )
        return false;

      if (
        filters.orderStatus !== "all" &&
        order.orderStatus !== filters.orderStatus
      )
        return false;

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          order._id.toLowerCase().includes(searchTerm) ||
          order.addressInfo?.address?.toLowerCase().includes(searchTerm) ||
          order.cartItems?.some((item) =>
            item.title.toLowerCase().includes(searchTerm)
          )
        );
      }

      return true;
    })
    ?.sort((a, b) => {
      if (filters.sortBy === "newest") {
        return new Date(b.orderDate) - new Date(a.orderDate);
      } else if (filters.sortBy === "oldest") {
        return new Date(a.orderDate) - new Date(b.orderDate);
      } else if (filters.sortBy === "amountHigh") {
        return b.totalAmount - a.totalAmount;
      } else if (filters.sortBy === "amountLow") {
        return a.totalAmount - b.totalAmount;
      }
      return 0;
    });

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

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-9"
              />
            </div>

            {/* Payment Method Filter */}
            <Select
              value={filters.paymentMethod}
              onValueChange={(value) =>
                setFilters({ ...filters, paymentMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="online">Online Payment</SelectItem>
              </SelectContent>
            </Select>

            {/* Order Status Filter */}
            <Select
              value={filters.orderStatus}
              onValueChange={(value) =>
                setFilters({ ...filters, orderStatus: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="inProcess">In Process</SelectItem>
                <SelectItem value="inShipping">In Shipping</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                setFilters({ ...filters, sortBy: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amountHigh">Amount: High to Low</SelectItem>
                <SelectItem value="amountLow">Amount: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Count */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Orders ({filteredAndSortedOrders?.length || 0})
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowUpDown className="h-4 w-4" />
          Sorted by{" "}
          {filters.sortBy === "newest"
            ? "newest"
            : filters.sortBy === "oldest"
            ? "oldest"
            : filters.sortBy === "amountHigh"
            ? "amount (high to low)"
            : "amount (low to high)"}
        </div>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading orders...</div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredAndSortedOrders && filteredAndSortedOrders.length > 0 ? (
            filteredAndSortedOrders.map((orderItem) => {
              const totalQty = orderItem?.cartItems?.reduce(
                (sum, item) => sum + item.quantity,
                0
              );
              const productCount = orderItem?.cartItems?.length;

              return (
                <Card
                  key={orderItem?._id}
                  className="shadow-md rounded-2xl hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span className="truncate text-sm font-mono">
                        #{orderItem?._id.slice(-8)}
                      </span>
                      <div className="flex gap-2">
                        <Badge
                          className={getPaymentBadgeColor(
                            orderItem?.paymentMethod
                          )}
                        >
                          {orderItem?.paymentMethod?.toUpperCase()}
                        </Badge>
                        <Badge
                          className={getBadgeColor(orderItem?.orderStatus)}
                        >
                          {orderItem?.orderStatus}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Date:</span>
                      <span>
                        {new Date(orderItem?.orderDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium">Total Price:</span>
                      <span className="font-bold">
                        ₹{parseFloat(orderItem?.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    {orderItem?.cashHandlingFee > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span className="font-medium">Cash Handling Fee:</span>
                        <span>₹{orderItem.cashHandlingFee}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="font-medium">Items:</span>
                      <span>
                        {productCount} product{productCount > 1 ? "s" : ""} (
                        {totalQty} pcs)
                      </span>
                    </div>

                    {orderItem?.paymentMethod === "online" &&
                      orderItem?.paymentId && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Payment ID:</span>
                          <span className="font-mono">
                            {orderItem.paymentId}
                          </span>
                        </div>
                      )}

                    <div className="flex justify-between">
                      <span className="font-medium">City:</span>
                      <span>{orderItem.addressInfo?.city}</span>
                    </div>

                    {/* Mini preview of cart items */}
                    <div className="space-y-1 pt-2">
                      {orderItem?.cartItems?.slice(0, 2).map((item) => (
                        <div key={item._id} className="flex items-center gap-2">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-muted-foreground">
                              ₹{parseFloat(item.price)} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                      {orderItem.cartItems.length > 2 && (
                        <div className="text-xs text-muted-foreground italic">
                          +{orderItem.cartItems.length - 2} more item(s)
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={(isOpen) => {
                          setOpenDetailsDialog(isOpen);
                          if (!isOpen) {
                            setTimeout(
                              () => dispatch(resetOrderDetails()),
                              200
                            );
                          }
                        }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                        >
                          View Details
                        </Button>
                        {orderDetails && (
                          <AdminOrderDetailsView orderDetails={orderDetails} />
                        )}
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No orders found</div>
              <p className="text-gray-500 text-sm">
                {filters.paymentMethod !== "all" ||
                filters.orderStatus !== "all" ||
                filters.search
                  ? "Try adjusting your filters"
                  : "No orders have been placed yet"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminOrdersView;
