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
import { Search, Filter, ArrowUpDown, Download, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    paymentMethod: "all",
    orderStatus: "all",
    search: "",
    sortBy: "newest",
    startDate: "",
    endDate: "",
  });

  const { orderList, orderDetails, isLoading, pendingRequests } = useSelector(
    (state) => state.adminOrder
  );
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  function handleCloseDialog() {
    setOpenDetailsDialog(false);
    // Reset order details after a short delay to allow dialog animation to complete
    setTimeout(() => {
      dispatch(resetOrderDetails());
    }, 300);
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin(filters));
  }, [dispatch, filters]);

  // Only open dialog when orderDetails changes AND we have actual data
  useEffect(() => {
    if (orderDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [orderDetails]);

  // Filter orders based on active tab and filters
  const filteredAndSortedOrders = orderList
    ?.filter((order) => {
      // Tab filtering
      if (activeTab === "pending" && order.orderStatus !== "pending")
        return false;
      if (activeTab === "cancellations" && !order.cancellation?.requested)
        return false;
      if (activeTab === "returns" && !order.return?.requested) return false;

      // Payment method filter
      if (
        filters.paymentMethod !== "all" &&
        order.paymentMethod !== filters.paymentMethod
      )
        return false;

      // Order status filter
      if (
        filters.orderStatus !== "all" &&
        order.orderStatus !== filters.orderStatus
      )
        return false;

      // Date range filter
      if (filters.startDate || filters.endDate) {
        const orderDate = new Date(order.orderDate);
        if (filters.startDate && orderDate < new Date(filters.startDate))
          return false;
        if (filters.endDate && orderDate > new Date(filters.endDate))
          return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          order._id.toLowerCase().includes(searchTerm) ||
          order.addressInfo?.name?.toLowerCase().includes(searchTerm) ||
          order.addressInfo?.phone?.includes(searchTerm) ||
          order.items?.some((item) =>
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
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "shipped":
        return "bg-purple-500";
      case "out_for_delivery":
        return "bg-orange-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      case "returned":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentBadgeColor = (method) => {
    return method === "cod" ? "bg-orange-500" : "bg-teal-500";
  };

  const getStatusText = (status) => {
    const statusMap = {
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
    };
    return statusMap[status] || status;
  };

  // Calculate statistics
  const stats = {
    total: orderList?.length || 0,
    pending:
      orderList?.filter((order) => order.orderStatus === "pending")?.length ||
      0,
    confirmed:
      orderList?.filter((order) => order.orderStatus === "confirmed")?.length ||
      0,
    delivered:
      orderList?.filter((order) => order.orderStatus === "delivered")?.length ||
      0,
    cancellations:
      orderList?.filter((order) => order.cancellation?.requested)?.length || 0,
    returns: orderList?.filter((order) => order.return?.requested)?.length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-blue-600">Total Orders</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-yellow-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.delivered}
            </div>
            <div className="text-sm text-green-600">Delivered</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.cancellations}
            </div>
            <div className="text-sm text-orange-600">Cancellations</div>
          </CardContent>
        </Card>
        <Card className="bg-pink-50 border-pink-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-pink-600">
              {stats.returns}
            </div>
            <div className="text-sm text-pink-600">Returns</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ₹
              {orderList
                ?.reduce((sum, order) => sum + order.totalAmount, 0)
                ?.toFixed(2)}
            </div>
            <div className="text-sm text-purple-600">Total Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="cancellations">Cancellations</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Filters Section */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="out_for_delivery">
                      Out for Delivery
                    </SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Range */}
                <div className="flex gap-2">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                  />
                </div>

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
                    <SelectItem value="amountHigh">
                      Amount: High to Low
                    </SelectItem>
                    <SelectItem value="amountLow">
                      Amount: Low to High
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Count */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {activeTab === "all"
                ? "All"
                : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
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
                  const totalQty = orderItem?.items?.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );
                  const productCount = orderItem?.items?.length;

                  return (
                    <Card
                      key={orderItem?._id}
                      className="shadow-md rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleFetchOrderDetails(orderItem?._id)}
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
                              {getStatusText(orderItem?.orderStatus)}
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Customer:</span>
                          <span>{orderItem.addressInfo?.name}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-medium">Date:</span>
                          <span>
                            {new Date(
                              orderItem?.orderDate
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-medium">Total Amount:</span>
                          <span className="font-bold">
                            ₹{parseFloat(orderItem?.totalAmount).toFixed(2)}
                          </span>
                        </div>

                        {orderItem?.cashHandlingFee > 0 && (
                          <div className="flex justify-between text-orange-600">
                            <span className="font-medium">
                              Cash Handling Fee:
                            </span>
                            <span>₹{orderItem.cashHandlingFee}</span>
                          </div>
                        )}

                        {orderItem?.shippingFee > 0 && (
                          <div className="flex justify-between text-blue-600">
                            <span className="font-medium">Shipping Fee:</span>
                            <span>₹{orderItem.shippingFee}</span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="font-medium">Items:</span>
                          <span>
                            {productCount} product{productCount > 1 ? "s" : ""}{" "}
                            ({totalQty} pcs)
                          </span>
                        </div>

                        {orderItem?.paymentMethod === "online" &&
                          orderItem?.paymentId && (
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Payment ID:</span>
                              <span className="font-mono">
                                {orderItem.paymentId.slice(-8)}
                              </span>
                            </div>
                          )}

                        <div className="flex justify-between">
                          <span className="font-medium">City:</span>
                          <span>{orderItem.addressInfo?.city}</span>
                        </div>

                        {/* Cancellation/Return Badges */}
                        <div className="flex gap-2">
                          {orderItem.cancellation?.requested && (
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-600"
                            >
                              Cancellation Requested
                            </Badge>
                          )}
                          {orderItem.return?.requested && (
                            <Badge
                              variant="outline"
                              className="text-pink-600 border-pink-600"
                            >
                              Return Requested
                            </Badge>
                          )}
                        </div>

                        {/* Mini preview of order items */}
                        <div className="space-y-1 pt-2">
                          {orderItem?.items?.slice(0, 2).map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center gap-2"
                            >
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {item.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Size: {item.selectedSize} | Color:{" "}
                                  {item.selectedColor}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ₹{parseFloat(item.price)} × {item.quantity}
                                </div>
                              </div>
                            </div>
                          ))}
                          {orderItem.items.length > 2 && (
                            <div className="text-xs text-muted-foreground italic">
                              +{orderItem.items.length - 2} more item(s)
                            </div>
                          )}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <Dialog
                            open={
                              openDetailsDialog &&
                              orderDetails?._id === orderItem?._id
                            }
                            onOpenChange={(isOpen) => {
                              if (!isOpen) {
                                handleCloseDialog();
                              }
                            }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFetchOrderDetails(orderItem?._id);
                              }}
                            >
                              View Details
                            </Button>
                            {orderDetails &&
                              orderDetails._id === orderItem._id && (
                                <AdminOrderDetailsView
                                  orderDetails={orderDetails}
                                  onClose={handleCloseDialog}
                                />
                              )}
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">
                    No orders found
                  </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminOrdersView;
