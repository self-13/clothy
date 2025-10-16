import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCancellationRequests,
  updateCancellationStatus,
} from "@/store/admin/order-slice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function AdminCancellations() {
  const dispatch = useDispatch();
  const { cancellationRequests, isLoading } = useSelector(
    (state) => state.adminOrder
  );
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [refundAmount, setRefundAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    dispatch(getCancellationRequests());
  }, [dispatch]);

  const handleAction = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setRefundAmount(type === "approve" ? request.totalAmount?.toString() : "");
    setAdminNotes("");
    setActionDialogOpen(true);
  };

  const submitAction = async () => {
    if (!selectedRequest) return;

    await dispatch(
      updateCancellationStatus({
        id: selectedRequest._id,
        status: actionType === "approve" ? "approved" : "rejected",
        refundAmount: actionType === "approve" ? parseFloat(refundAmount) : 0,
        adminNotes,
      })
    );

    setActionDialogOpen(false);
    setSelectedRequest(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case "delivered":
        return <Badge className="bg-blue-500">Delivered</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cancellation Requests</h1>
        <Button
          onClick={() => dispatch(getCancellationRequests())}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Approve Cancellation"
                : "Reject Cancellation"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Approve this cancellation request and process refund."
                : "Reject this cancellation request with a reason."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === "approve" && (
              <div className="space-y-2">
                <Label htmlFor="refundAmount">Refund Amount</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Enter refund amount"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="adminNotes">
                Admin Notes {actionType === "reject" && "*"}
              </Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter notes for the customer..."
                required={actionType === "reject"}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setActionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitAction}
                disabled={actionType === "reject" && !adminNotes.trim()}
                variant={actionType === "approve" ? "default" : "destructive"}
              >
                {actionType === "approve"
                  ? "Approve Cancellation"
                  : "Reject Cancellation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6">
        {cancellationRequests.length > 0 ? (
          cancellationRequests.map((request) => (
            <Card key={request._id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{request._id.slice(-8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Requested:{" "}
                      {new Date(
                        request.cancellation?.requestedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(request.cancellation?.status)}
                    {getOrderStatusBadge(request.orderStatus)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-medium mb-3">Customer Information</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Name: {request.userId?.userName || "N/A"}</p>
                    <p>Email: {request.userId?.email || "N/A"}</p>
                  </div>
                </div>

                <Separator />

                {/* Cancellation Reason */}
                <div>
                  <h4 className="font-medium mb-2">Cancellation Reason</h4>
                  <p className="text-sm bg-muted/30 p-3 rounded-md">
                    {request.cancellation?.reason}
                  </p>
                </div>

                <Separator />

                {/* Product Items with Images */}
                <div>
                  <h4 className="font-medium mb-3">Products</h4>
                  <div className="space-y-3">
                    {request.items?.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="flex items-center gap-4 p-3 border rounded-lg bg-white"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg"; // Fallback image
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.title}
                          </p>
                          {item.brand && (
                            <p className="text-xs text-muted-foreground">
                              Brand: {item.brand}
                            </p>
                          )}
                          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                            {item.selectedSize && (
                              <span>Size: {item.selectedSize}</span>
                            )}
                            {item.selectedColor && (
                              <span>Color: {item.selectedColor}</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-sm font-semibold">
                              ₹{item.price} x {item.quantity}
                            </p>
                            <p className="text-sm font-bold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div>
                  <h4 className="font-medium mb-3">Order Summary</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        ₹
                        {request.totalAmount -
                          (request.shippingFee || 0) -
                          (request.cashHandlingFee || 0)}
                      </span>
                    </div>
                    {request.shippingFee > 0 && (
                      <div className="flex justify-between">
                        <span>Shipping Fee:</span>
                        <span>₹{request.shippingFee}</span>
                      </div>
                    )}
                    {request.cashHandlingFee > 0 && (
                      <div className="flex justify-between">
                        <span>Cash Handling Fee:</span>
                        <span>₹{request.cashHandlingFee}</span>
                      </div>
                    )}
                    {request.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₹{request.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total Amount:</span>
                      <span>₹{request.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="uppercase">{request.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons for Pending Requests */}
                {request.cancellation?.status === "pending" && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleAction(request, "approve")}
                      className="flex-1"
                      variant="default"
                      size="lg"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAction(request, "reject")}
                      className="flex-1"
                      variant="destructive"
                      size="lg"
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {/* Show refund amount if approved */}
                {request.cancellation?.status === "approved" &&
                  request.cancellation?.refundAmount && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500">Refund Processed</Badge>
                        <p className="text-sm text-green-800 font-medium">
                          Refund Amount: ₹{request.cancellation.refundAmount}
                        </p>
                      </div>
                      {request.cancellation.adminNotes && (
                        <p className="text-sm text-green-700 mt-2">
                          <strong>Notes:</strong>{" "}
                          {request.cancellation.adminNotes}
                        </p>
                      )}
                    </div>
                  )}

                {/* Show rejection reason if rejected */}
                {request.cancellation?.status === "rejected" &&
                  request.cancellation?.adminNotes && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-500">Rejected</Badge>
                        <p className="text-sm text-red-800 font-medium">
                          Request Rejected
                        </p>
                      </div>
                      <p className="text-sm text-red-700 mt-2">
                        <strong>Reason:</strong>{" "}
                        {request.cancellation.adminNotes}
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground space-y-2">
                <p className="text-lg">No cancellation requests found</p>
                <p className="text-sm">
                  All cancellation requests will appear here for review
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AdminCancellations;
