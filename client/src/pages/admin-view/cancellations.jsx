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
            <Card key={request._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{request._id.slice(-6)}
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

              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>Name: {request.userId?.userName || "N/A"}</p>
                    <p>Email: {request.userId?.email || "N/A"}</p>
                  </div>
                </div>

                <Separator />

                {/* Cancellation Reason */}
                <div>
                  <h4 className="font-medium mb-2">Cancellation Reason</h4>
                  <p className="text-sm">{request.cancellation?.reason}</p>
                </div>

                <Separator />

                {/* Order Summary */}
                <div>
                  <h4 className="font-medium mb-2">Order Summary</h4>
                  <div className="text-sm space-y-1">
                    <p>Total Amount: ₹{request.totalAmount}</p>
                    <p>Payment Method: {request.paymentMethod}</p>
                    <p>Items: {request.cartItems?.length} product(s)</p>
                  </div>
                </div>

                {/* Action Buttons for Pending Requests */}
                {request.cancellation?.status === "pending" && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleAction(request, "approve")}
                      className="flex-1"
                      variant="default"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAction(request, "reject")}
                      className="flex-1"
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {/* Show refund amount if approved */}
                {request.cancellation?.status === "approved" &&
                  request.cancellation?.refundAmount && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <p className="text-sm text-green-800">
                        <strong>Refund Amount:</strong> ₹
                        {request.cancellation.refundAmount}
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No cancellation requests found.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AdminCancellations;
